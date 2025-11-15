<template>
  <div>
    <div class="text-h6 mb-4">{{ $t('locations.linkedItems') }}</div>

    <!-- Add Item -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-autocomplete
          v-model="selectedItem"
          :items="availableItems"
          item-title="name"
          item-value="id"
          :label="$t('locations.selectItem')"
          :placeholder="$t('locations.selectItemPlaceholder')"
          variant="outlined"
          clearable
          class="mb-2"
        />
        <v-select
          v-model="relationType"
          :items="relationTypeSuggestions"
          item-title="title"
          item-value="value"
          :label="$t('locations.relationType')"
          variant="outlined"
          class="mb-2"
        />
        <v-btn color="primary" block :disabled="!selectedItem || !relationType" @click="handleAdd">
          {{ $t('locations.linkItem') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Linked Items List -->
    <v-list v-if="linkedItems.length > 0" class="pa-0">
      <v-list-item v-for="item in linkedItems" :key="item.id" class="mb-2 px-0">
        <template #prepend>
          <v-avatar size="48" rounded="lg" class="mr-2">
            <v-img v-if="item.image_url" :src="`/uploads/${item.image_url}`" cover />
            <v-icon v-else>mdi-treasure-chest</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>
          {{ item.name }}
          <v-chip v-if="item.direction === 'incoming'" size="x-small" color="info" class="ml-2">
            ←
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle v-if="item.description">
          {{ item.description.substring(0, 100) }}{{ item.description.length > 100 ? '...' : '' }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            v-if="item.direction === 'outgoing' || !item.direction"
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="$emit('remove', item.id)"
          />
          <v-tooltip v-else location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" color="info" size="small"> mdi-information </v-icon>
            </template>
            {{ $t('locations.incomingItemTooltip') }}
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>
    <v-empty-state
      v-else
      icon="mdi-treasure-chest-outline"
      :title="$t('locations.noLinkedItems')"
      :text="$t('locations.noLinkedItemsText')"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Item {
  id: number
  name: string
  description: string | null
  image_url: string | null
  direction?: 'outgoing' | 'incoming'
}

interface Props {
  linkedItems: Item[]
  availableItems: { id: number; name: string }[]
}

defineProps<Props>()

const emit = defineEmits<{
  add: [payload: { itemId: number; relationType: string }]
  remove: [itemId: number]
}>()

const selectedItem = ref<number | null>(null)
const relationType = ref<string>('contains')

const relationTypeSuggestions = computed(() => [
  { title: t('locations.itemRelationTypes.contains'), value: 'contains' },
  { title: t('locations.itemRelationTypes.hidden'), value: 'hidden' },
  { title: t('locations.itemRelationTypes.displayed'), value: 'displayed' },
  { title: t('locations.itemRelationTypes.stored'), value: 'stored' },
  { title: t('locations.itemRelationTypes.lost'), value: 'lost' },
  { title: t('locations.itemRelationTypes.guarded'), value: 'guarded' },
])

function handleAdd() {
  if (selectedItem.value && relationType.value) {
    emit('add', {
      itemId: selectedItem.value,
      relationType: relationType.value,
    })
    selectedItem.value = null
    relationType.value = 'contains'
  }
}
</script>

<style scoped>
/* Remove excessive left padding from lists */
:deep(.v-list) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.v-list-item) {
  padding-left: 0 !important;
  padding-inline-start: 0 !important;
}

:deep(.v-list-item__prepend) {
  margin-inline-end: 8px !important;
  width: auto !important;
}

:deep(.v-list-item__prepend > .v-avatar) {
  margin-inline-end: 0 !important;
}
</style>
