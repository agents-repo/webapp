import { describe, expect, it } from 'vitest'
import {
  CHAT_PLATFORM_GUIDES,
  buildChatInstructionCopyUrls,
  buildChatInstructionLatestUrlFromPath,
  buildChatPlatformOpenUrl,
  buildChatStarterPrompt,
  findChatInstruction,
  groupChatInstructionsByKind,
  instructionOptionKey,
  parseChatInstructionsManifest,
  wrapChatInstructionMarkdownForPaste,
  type ChatInstructionEntry,
} from './chatConsumption'

const helloAgentEntry: ChatInstructionEntry = {
  kind: 'agent',
  id: 'hello-agent',
  path: '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-agent.agent.md',
}

const helloFlowEntry: ChatInstructionEntry = {
  kind: 'flow',
  id: 'hello-agents',
  path: '/pkg/agents-repo/hello-agent/1.0.1/flows/hello-agents.agent.md',
  agentInstructions: [
    '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-agent.agent.md',
    '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-again.agent.md',
  ],
}

const validManifest = {
  schemaVersion: '1.0.0',
  package: 'agents-repo/hello-agent',
  version: '1.0.1',
  instructions: [
    {
      kind: 'agent',
      id: 'hello-again',
      path: '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-again.agent.md',
    },
    helloAgentEntry,
    helloFlowEntry,
  ],
}

describe('parseChatInstructionsManifest', () => {
  it('parses a valid instructions.json payload', () => {
    expect(parseChatInstructionsManifest(validManifest)).toEqual({
      schemaVersion: '1.0.0',
      package: 'agents-repo/hello-agent',
      version: '1.0.1',
      instructions: [
        {
          kind: 'agent',
          id: 'hello-again',
          path: '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-again.agent.md',
        },
        helloAgentEntry,
        helloFlowEntry,
      ],
    })
  })

  it('rejects missing fields, invalid kinds, and non-/pkg/ paths', () => {
    expect(parseChatInstructionsManifest(null)).toBeNull()
    expect(parseChatInstructionsManifest({ ...validManifest, instructions: 'nope' })).toBeNull()
    expect(
      parseChatInstructionsManifest({
        ...validManifest,
        instructions: [{ kind: 'tool', id: 'x', path: '/pkg/a/b/1.0.0/agents/x.agent.md' }],
      }),
    ).toBeNull()
    expect(
      parseChatInstructionsManifest({
        ...validManifest,
        instructions: [{ kind: 'agent', id: 'x', path: 'packages/x.agent.md' }],
      }),
    ).toBeNull()
  })

  it('omits empty agentInstructions and rejects invalid agentInstruction paths', () => {
    expect(
      parseChatInstructionsManifest({
        ...validManifest,
        instructions: [
          {
            kind: 'flow',
            id: 'solo-flow',
            path: '/pkg/agents-repo/hello-agent/1.0.1/flows/solo-flow.agent.md',
            agentInstructions: [],
          },
        ],
      }),
    ).toEqual({
      schemaVersion: '1.0.0',
      package: 'agents-repo/hello-agent',
      version: '1.0.1',
      instructions: [
        {
          kind: 'flow',
          id: 'solo-flow',
          path: '/pkg/agents-repo/hello-agent/1.0.1/flows/solo-flow.agent.md',
        },
      ],
    })

    expect(
      parseChatInstructionsManifest({
        ...validManifest,
        instructions: [
          {
            kind: 'flow',
            id: 'bad-flow',
            path: '/pkg/agents-repo/hello-agent/1.0.1/flows/bad-flow.agent.md',
            agentInstructions: ['not-a-pkg-path'],
          },
        ],
      }),
    ).toBeNull()
  })
})

describe('groupChatInstructionsByKind', () => {
  it('groups agents then flows without using package category', () => {
    const parsed = parseChatInstructionsManifest(validManifest)
    expect(parsed).not.toBeNull()
    expect(groupChatInstructionsByKind(parsed!.instructions)).toEqual([
      {
        kind: 'agent',
        label: 'Agents',
        instructions: [
          {
            kind: 'agent',
            id: 'hello-again',
            path: '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-again.agent.md',
          },
          helloAgentEntry,
        ],
      },
      {
        kind: 'flow',
        label: 'Flows',
        instructions: [helloFlowEntry],
      },
    ])
  })
})

describe('instruction lookup', () => {
  it('finds an instruction by kind and id key', () => {
    expect(instructionOptionKey(helloFlowEntry)).toBe('flow:hello-agents')
    expect(findChatInstruction([helloAgentEntry, helloFlowEntry], 'flow:hello-agents')).toEqual(helloFlowEntry)
    expect(findChatInstruction([helloAgentEntry], 'flow:hello-agents')).toBeNull()
  })
})

describe('copy URLs and starter prompts', () => {
  const baseUrl = 'https://registry-proxy.example.workers.dev?ref=v2.x'

  it('builds latest short-alias, pinned version query, and version-in-path fetch URLs', () => {
    expect(buildChatInstructionCopyUrls(baseUrl, 'agents-repo', 'hello-agent', '1.0.1', helloAgentEntry)).toEqual({
      latestUrl:
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/hello-agent/agents/hello-agent.agent.md?ref=v2.x',
      pinnedUrl:
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/hello-agent/agents/hello-agent.agent.md?ref=v2.x&version=1.0.1',
      fetchUrl:
        'https://registry-proxy.example.workers.dev/pkg/agents-repo/hello-agent/1.0.1/agents/hello-agent.agent.md?ref=v2.x',
    })
  })

  it('converts version-in-path agentInstructions to latest short-alias URLs', () => {
    expect(
      buildChatInstructionLatestUrlFromPath(
        baseUrl,
        '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-again.agent.md',
      ),
    ).toBe(
      'https://registry-proxy.example.workers.dev/pkg/agents-repo/hello-agent/agents/hello-again.agent.md?ref=v2.x',
    )
    expect(buildChatInstructionLatestUrlFromPath(baseUrl, 'packages/not-pkg')).toBeNull()
  })

  it('builds agent and flow-aware starter prompts from latest URLs', () => {
    expect(buildChatStarterPrompt(helloAgentEntry, 'https://example.test/agent')).toBe(
      'Follow these agent instructions:\nhttps://example.test/agent',
    )
    expect(buildChatStarterPrompt({ ...helloFlowEntry, agentInstructions: undefined }, 'https://example.test/flow')).toBe(
      'Follow this flow:\nhttps://example.test/flow',
    )
    expect(
      buildChatStarterPrompt(helloFlowEntry, 'https://example.test/flow', [
        'https://example.test/agent-1',
        'https://example.test/agent-2',
      ]),
    ).toBe(
      'Follow this flow:\nhttps://example.test/flow\n\nLoad these agent instructions in order:\n1. https://example.test/agent-1\n2. https://example.test/agent-2',
    )
  })

  it('labels Microsoft Copilot as web to distinguish IDE downloads', () => {
    expect(CHAT_PLATFORM_GUIDES.map((guide) => guide.id)).toEqual(['chatgpt', 'gemini', 'copilot-web'])
    expect(CHAT_PLATFORM_GUIDES.find((guide) => guide.id === 'copilot-web')?.label).toBe(
      'Microsoft Copilot (web)',
    )
  })

  it('builds a ChatGPT open URL from the starter prompt and returns null otherwise', () => {
    const starterPrompt = 'Follow these agent instructions:\nhttps://example.test/agent'
    expect(buildChatPlatformOpenUrl('chatgpt', starterPrompt)).toBe(
      `https://chatgpt.com/?q=${encodeURIComponent(starterPrompt)}`,
    )
    expect(buildChatPlatformOpenUrl('chatgpt', starterPrompt)).toContain('%20')
    expect(buildChatPlatformOpenUrl('chatgpt', starterPrompt)).toContain('%0A')
    expect(buildChatPlatformOpenUrl('gemini', starterPrompt)).toBeNull()
    expect(buildChatPlatformOpenUrl('copilot-web', starterPrompt)).toBeNull()
    expect(buildChatPlatformOpenUrl('chatgpt', '')).toBeNull()
    expect(buildChatPlatformOpenUrl('chatgpt', '   ')).toBeNull()
  })

  it('wraps copied instruction markdown with a kind-aware preamble', () => {
    expect(wrapChatInstructionMarkdownForPaste('agent', '# Sample agent')).toBe(
      'Follow these agent instructions:\n\n# Sample agent',
    )
    expect(wrapChatInstructionMarkdownForPaste('flow', '# Sample flow')).toBe(
      'Follow this flow:\n\n# Sample flow',
    )
  })

  it('keeps Gemini and Copilot how-to steps as copy-paste without Open in ChatGPT', () => {
    const chatgptSteps = CHAT_PLATFORM_GUIDES.find((guide) => guide.id === 'chatgpt')?.steps ?? []
    const geminiSteps = CHAT_PLATFORM_GUIDES.find((guide) => guide.id === 'gemini')?.steps ?? []
    const copilotSteps = CHAT_PLATFORM_GUIDES.find((guide) => guide.id === 'copilot-web')?.steps ?? []

    expect(chatgptSteps.join(' ')).toContain('Open in ChatGPT')
    expect(geminiSteps.join(' ')).not.toContain('Open in ChatGPT')
    expect(copilotSteps.join(' ')).not.toContain('Open in ChatGPT')
  })
})
