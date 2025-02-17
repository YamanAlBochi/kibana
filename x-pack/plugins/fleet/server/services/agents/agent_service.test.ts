/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

jest.mock('../security');
jest.mock('./crud');
jest.mock('./status');
jest.mock('./versions');

import type { ElasticsearchClient, SavedObjectsClientContract } from '@kbn/core/server';
import {
  elasticsearchServiceMock,
  httpServerMock,
  savedObjectsClientMock,
} from '@kbn/core/server/mocks';

import { FleetUnauthorizedError } from '../../errors';

import { getAuthzFromRequest } from '../security';
import type { FleetAuthz } from '../../../common';
import { createFleetAuthzMock } from '../../../common/mocks';

import type { AgentClient } from './agent_service';
import { AgentServiceImpl } from './agent_service';
import { getAgentsByKuery, getAgentById } from './crud';
import { getAgentStatusById, getAgentStatusForAgentPolicy } from './status';
import { getLatestAvailableVersion } from './versions';

const mockGetAuthzFromRequest = getAuthzFromRequest as jest.Mock<Promise<FleetAuthz>>;
const mockGetAgentsByKuery = getAgentsByKuery as jest.Mock;
const mockGetAgentById = getAgentById as jest.Mock;
const mockGetAgentStatusById = getAgentStatusById as jest.Mock;
const mockGetAgentStatusForAgentPolicy = getAgentStatusForAgentPolicy as jest.Mock;
const mockGetLatestAvailableVersion = getLatestAvailableVersion as jest.Mock;

describe('AgentService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('asScoped', () => {
    describe('without required privilege', () => {
      const agentClient = new AgentServiceImpl(
        elasticsearchServiceMock.createElasticsearchClient(),
        savedObjectsClientMock.create()
      ).asScoped(httpServerMock.createKibanaRequest());

      beforeEach(() =>
        mockGetAuthzFromRequest.mockReturnValue(
          Promise.resolve({
            fleet: {
              all: false,
              setup: false,
              readAgents: false,
              readEnrollmentTokens: false,
              readAgentPolicies: false,
              allAgentPolicies: false,
              allAgents: false,
              allSettings: false,
              readSettings: false,
            },
            integrations: {
              readPackageInfo: false,
              readInstalledPackages: false,
              installPackages: false,
              upgradePackages: false,
              uploadPackages: false,
              removePackages: false,
              readPackageSettings: false,
              writePackageSettings: false,
              readIntegrationPolicies: false,
              writeIntegrationPolicies: false,
            },
          })
        )
      );

      it('rejects on listAgents', async () => {
        await expect(agentClient.listAgents({ showInactive: true })).rejects.toThrowError(
          new FleetUnauthorizedError(
            `User does not have adequate permissions to access Fleet agents.`
          )
        );
      });

      it('rejects on getAgent', async () => {
        await expect(agentClient.getAgent('foo')).rejects.toThrowError(
          new FleetUnauthorizedError(
            `User does not have adequate permissions to access Fleet agents.`
          )
        );
      });

      it('rejects on getAgentStatusById', async () => {
        await expect(agentClient.getAgentStatusById('foo')).rejects.toThrowError(
          new FleetUnauthorizedError(
            `User does not have adequate permissions to access Fleet agents.`
          )
        );
      });

      it('rejects on getAgentStatusForAgentPolicy', async () => {
        await expect(agentClient.getAgentStatusForAgentPolicy()).rejects.toThrowError(
          new FleetUnauthorizedError(
            `User does not have adequate permissions to access Fleet agents.`
          )
        );
      });

      it('rejects on getLatestAgentAvailableVersion', async () => {
        await expect(agentClient.getLatestAgentAvailableVersion()).rejects.toThrowError(
          new FleetUnauthorizedError(
            `User does not have adequate permissions to access Fleet agents.`
          )
        );
      });
    });

    describe('with required privilege', () => {
      const mockEsClient = elasticsearchServiceMock.createElasticsearchClient();
      const mockSoClient = savedObjectsClientMock.create();
      const agentClient = new AgentServiceImpl(mockEsClient, mockSoClient).asScoped(
        httpServerMock.createKibanaRequest()
      );

      beforeEach(() =>
        mockGetAuthzFromRequest.mockReturnValue(Promise.resolve(createFleetAuthzMock()))
      );

      expectApisToCallServicesSuccessfully(mockEsClient, mockSoClient, agentClient);
    });
  });

  describe('asInternalUser', () => {
    const mockEsClient = elasticsearchServiceMock.createElasticsearchClient();
    const mockSoClient = savedObjectsClientMock.create();
    const agentClient = new AgentServiceImpl(mockEsClient, mockSoClient).asInternalUser;

    expectApisToCallServicesSuccessfully(mockEsClient, mockSoClient, agentClient);
  });
});

function expectApisToCallServicesSuccessfully(
  mockEsClient: ElasticsearchClient,
  mockSoClient: jest.Mocked<SavedObjectsClientContract>,
  agentClient: AgentClient
) {
  test('client.listAgents calls getAgentsByKuery and returns results', async () => {
    mockGetAgentsByKuery.mockResolvedValue('getAgentsByKuery success');
    await expect(agentClient.listAgents({ showInactive: true })).resolves.toEqual(
      'getAgentsByKuery success'
    );
    expect(mockGetAgentsByKuery).toHaveBeenCalledWith(mockEsClient, mockSoClient, {
      showInactive: true,
    });
  });

  test('client.getAgent calls getAgentById and returns results', async () => {
    mockGetAgentById.mockResolvedValue('getAgentById success');
    await expect(agentClient.getAgent('foo-id')).resolves.toEqual('getAgentById success');
    expect(mockGetAgentById).toHaveBeenCalledWith(mockEsClient, mockSoClient, 'foo-id');
  });

  test('client.getAgentStatusById calls getAgentStatusById and returns results', async () => {
    mockGetAgentStatusById.mockResolvedValue('getAgentStatusById success');
    await expect(agentClient.getAgentStatusById('foo-id')).resolves.toEqual(
      'getAgentStatusById success'
    );
    expect(mockGetAgentStatusById).toHaveBeenCalledWith(mockEsClient, mockSoClient, 'foo-id');
  });

  test('client.getAgentStatusForAgentPolicy calls getAgentStatusForAgentPolicy and returns results', async () => {
    mockGetAgentStatusForAgentPolicy.mockResolvedValue('getAgentStatusForAgentPolicy success');
    await expect(agentClient.getAgentStatusForAgentPolicy('foo-id', 'foo-filter')).resolves.toEqual(
      'getAgentStatusForAgentPolicy success'
    );
    expect(mockGetAgentStatusForAgentPolicy).toHaveBeenCalledWith(
      mockEsClient,
      mockSoClient,
      'foo-id',
      'foo-filter'
    );
  });

  test('client.getLatestAgentAvailableVersion calls getLatestAvailableVersion and returns results', async () => {
    mockGetLatestAvailableVersion.mockResolvedValue('getLatestAvailableVersion success');
    await expect(agentClient.getLatestAgentAvailableVersion()).resolves.toEqual(
      'getLatestAvailableVersion success'
    );
    expect(mockGetLatestAvailableVersion).toHaveBeenCalledTimes(1);
  });
}
