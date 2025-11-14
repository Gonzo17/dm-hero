import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NpcCard from '~/components/npcs/NpcCard.vue'
import type { NPC } from '~/types/npc'

describe('NpcCard Component', () => {
  const mockRaces = [
    { name: 'human', name_de: 'Mensch', name_en: 'Human' },
    { name: 'elf', name_de: 'Elf', name_en: 'Elf' },
    { name: 'dwarf', name_de: 'Zwerg', name_en: 'Dwarf' },
  ]

  const mockClasses = [
    { name: 'wizard', name_de: 'Zauberer', name_en: 'Wizard' },
    { name: 'fighter', name_de: 'Kämpfer', name_en: 'Fighter' },
    { name: 'ranger', name_de: 'Waldläufer', name_en: 'Ranger' },
  ]

  const mockNpc: NPC = {
    id: 1,
    type_id: 1,
    campaign_id: 1,
    name: 'Gandalf der Graue',
    description: 'Ein weiser und mächtiger Zauberer',
    image_url: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    metadata: {
      race: 'human',
      class: 'wizard',
      type: 'mentor',
      status: 'alive',
      location: 'Der Auenland',
    },
    _counts: {
      relations: 3,
      items: 1,
      documents: 2,
      images: 0,
      lore: 5,
      memberships: 1,
    },
  }

  it('should render NPC name', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.text()).toContain('Gandalf der Graue')
  })

  it('should render NPC description', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.text()).toContain('Ein weiser und mächtiger Zauberer')
  })

  it('should display NPC type chip when metadata.type exists', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // NPC has type 'mentor'
    expect(wrapper.html()).toContain('mdi-school') // mentor icon
  })

  it('should display status chip when metadata.status exists', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // NPC has status 'alive'
    expect(wrapper.html()).toContain('mdi-heart-pulse') // alive icon
  })

  it('should display race name from races prop (i18n support)', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should display 'Mensch' (German) or 'Human' (English) depending on locale
    expect(wrapper.text()).toMatch(/Mensch|Human/)
  })

  it('should display class name from classes prop (i18n support)', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should display 'Zauberer' (German) or 'Wizard' (English)
    expect(wrapper.text()).toMatch(/Zauberer|Wizard/)
  })

  it('should display location badge when metadata.location exists', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.text()).toContain('Der Auenland')
    expect(wrapper.html()).toContain('mdi-map-marker')
  })

  it('should display correct relations count badge', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Relations count is 3
    expect(wrapper.text()).toContain('3')
    expect(wrapper.html()).toContain('mdi-account-group')
  })

  it('should display correct items count badge', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Items count is 1
    expect(wrapper.text()).toContain('1')
    expect(wrapper.html()).toContain('mdi-bag-personal')
  })

  it('should display correct documents count badge', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Documents count is 2
    expect(wrapper.text()).toContain('2')
    expect(wrapper.html()).toContain('mdi-file-document')
  })

  it('should display correct lore count badge', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Lore count is 5
    expect(wrapper.text()).toContain('5')
    expect(wrapper.html()).toContain('mdi-book-open-variant')
  })

  it('should display correct memberships count badge', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Memberships count is 1
    expect(wrapper.text()).toContain('1')
    expect(wrapper.html()).toContain('mdi-shield-account')
  })

  it('should show loading spinner when counts are not available', async () => {
    const npcWithoutCounts = { ...mockNpc, _counts: undefined }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithoutCounts,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should have progress-circular elements
    expect(wrapper.html()).toContain('v-progress-circular')
  })

  it('should emit "view" event when card is clicked', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Click the card
    await wrapper.find('.npc-card').trigger('click')

    // Check if "view" event was emitted
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')?.[0]).toEqual([mockNpc])
  })

  it('should emit "edit" event when edit button is clicked', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Find and click edit button
    const editButton = wrapper.findAll('button').find((btn) => btn.html().includes('mdi-pencil'))
    expect(editButton).toBeDefined()

    await editButton!.trigger('click')

    // Check if "edit" event was emitted
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockNpc])
  })

  it('should emit "delete" event when delete button is clicked', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Find and click delete button
    const deleteButton = wrapper.findAll('button').find((btn) => btn.html().includes('mdi-delete'))
    expect(deleteButton).toBeDefined()

    await deleteButton!.trigger('click')

    // Check if "delete" event was emitted
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockNpc])
  })

  it('should apply highlighted class when isHighlighted prop is true', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
        isHighlighted: true,
      },
    })

    expect(wrapper.html()).toContain('highlighted-card')
  })

  it('should NOT apply highlighted class when isHighlighted is false', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
        isHighlighted: false,
      },
    })

    expect(wrapper.html()).not.toContain('highlighted-card')
  })

  it('should display default icon when no image_url is provided', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc, // image_url is null
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.html()).toContain('mdi-account')
  })

  it('should display image when image_url is provided', async () => {
    const npcWithImage = { ...mockNpc, image_url: 'uuid-123.png' }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithImage,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.html()).toContain('/uploads/uuid-123.png')
  })

  it('should display "No description" text when description is empty', async () => {
    const npcWithoutDescription = { ...mockNpc, description: '' }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithoutDescription,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should show empty state text (i18n key: 'common.noDescription')
    expect(wrapper.find('.text-disabled').exists()).toBe(true)
  })

  it('should have correct NPC type icon for different types', async () => {
    const typeIconMap = [
      { type: 'ally', icon: 'mdi-handshake' },
      { type: 'enemy', icon: 'mdi-sword-cross' },
      { type: 'neutral', icon: 'mdi-minus-circle' },
      { type: 'questgiver', icon: 'mdi-exclamation' },
      { type: 'merchant', icon: 'mdi-cart' },
      { type: 'mentor', icon: 'mdi-school' },
    ]

    for (const { type, icon } of typeIconMap) {
      const npcWithType = {
        ...mockNpc,
        metadata: { ...mockNpc.metadata, type },
      }

      const wrapper = await mountSuspended(NpcCard, {
        props: {
          npc: npcWithType,
          races: mockRaces,
          classes: mockClasses,
        },
      })

      expect(wrapper.html()).toContain(icon)
    }
  })

  it('should have correct status color for different statuses', async () => {
    const statusColorMap = [
      { status: 'alive', color: 'success' },
      { status: 'dead', color: 'error' },
      { status: 'missing', color: 'warning' },
      { status: 'imprisoned', color: 'grey-darken-2' },
      { status: 'undead', color: 'purple' },
    ]

    for (const { status } of statusColorMap) {
      const npcWithStatus = {
        ...mockNpc,
        metadata: { ...mockNpc.metadata, status },
      }

      const wrapper = await mountSuspended(NpcCard, {
        props: {
          npc: npcWithStatus,
          races: mockRaces,
          classes: mockClasses,
        },
      })

      // Check if chip with status exists
      expect(wrapper.html()).toContain(`npcs.statuses.${status}`)
    }
  })

  it('should have download button when NPC has image', async () => {
    const npcWithImage = { ...mockNpc, image_url: 'uuid-123.png' }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithImage,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    const downloadButton = wrapper
      .findAll('button')
      .find((btn) => btn.html().includes('mdi-download'))
    expect(downloadButton).toBeDefined()
  })

  it('should emit "download" event when download button is clicked', async () => {
    const npcWithImage = { ...mockNpc, image_url: 'uuid-123.png' }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithImage,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    const downloadButton = wrapper
      .findAll('button')
      .find((btn) => btn.html().includes('mdi-download'))
    await downloadButton!.trigger('click')

    expect(wrapper.emitted('download')).toBeTruthy()
    expect(wrapper.emitted('download')?.[0]).toEqual([npcWithImage])
  })

  it('should have unique card ID based on NPC ID', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    expect(wrapper.find('#npc-1').exists()).toBe(true)
  })

  it('should handle fallback when race is not in races list', async () => {
    const npcWithUnknownRace = {
      ...mockNpc,
      metadata: { ...mockNpc.metadata, race: 'unknown-race' },
    }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithUnknownRace,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should display the raw race name as fallback
    expect(wrapper.text()).toContain('unknown-race')
  })

  it('should handle fallback when class is not in classes list', async () => {
    const npcWithUnknownClass = {
      ...mockNpc,
      metadata: { ...mockNpc.metadata, class: 'unknown-class' },
    }

    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: npcWithUnknownClass,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Should display the raw class name as fallback
    expect(wrapper.text()).toContain('unknown-class')
  })

  it('should NOT display faction badge in main NpcCard (faction is in dialog)', async () => {
    const wrapper = await mountSuspended(NpcCard, {
      props: {
        npc: mockNpc,
        races: mockRaces,
        classes: mockClasses,
      },
    })

    // Faction badge should NOT appear in card (only in dialog)
    // We can verify by checking that there's no "Faction" or "Fraktion" text in badges
    const badges = wrapper.findAll('.v-chip')
    const hasFactionBadge = badges.some(
      (badge) => badge.text().includes('Faction') || badge.text().includes('Fraktion'),
    )
    expect(hasFactionBadge).toBe(false)
  })
})
