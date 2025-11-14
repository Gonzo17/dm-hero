<template>
  <div>
    <div class="text-h6 mb-4">
      {{ $t('factions.linkedLore') }}
    </div>

    <v-list v-if="lore.length > 0">
      <v-list-item v-for="loreItem in lore" :key="loreItem.id" class="mb-2" border>
        <template #prepend>
          <v-avatar v-if="loreItem.image_url" size="40" rounded="lg">
            <v-img :src="`/uploads/${loreItem.image_url}`" />
          </v-avatar>
          <v-icon v-else icon="mdi-book-open-variant" color="primary" />
        </template>
        <v-list-item-title>
          {{ loreItem.name }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="loreItem.description">
          {{ loreItem.description.substring(0, 100)
          }}{{ loreItem.description.length > 100 ? '...' : '' }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="$emit('remove', loreItem.id)"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-empty-state
      v-else
      icon="mdi-book-off"
      :title="$t('factions.noLinkedLore')"
      :text="$t('factions.noLinkedLoreText')"
    />

    <v-divider class="my-4" />

    <div class="text-h6 mb-4">
      {{ $t('factions.addLore') }}
    </div>

    <v-autocomplete
      v-model="localLoreId"
      :items="availableLore"
      item-title="name"
      item-value="id"
      :label="$t('factions.selectLore')"
      :placeholder="$t('factions.selectLorePlaceholder')"
      variant="outlined"
      clearable
      class="mb-2"
    />

    <v-btn color="primary" block :disabled="!localLoreId" @click="handleAdd">
      {{ $t('factions.linkLore') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface FactionLore {
  id: number
  name: string
  description: string | null
  image_url: string | null
}

interface AvailableLore {
  id: number
  name: string
}

interface Props {
  lore: FactionLore[]
  availableLore: AvailableLore[]
}

interface Emits {
  (e: 'add', loreId: number): void
  (e: 'remove', relationId: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const localLoreId = ref<number | null>(null)

function handleAdd() {
  if (!localLoreId.value) return

  emit('add', localLoreId.value)

  // Reset form
  localLoreId.value = null
}
</script>
