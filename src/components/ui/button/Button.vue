<script setup>
import { cn } from "@/lib/utils";
import { Primitive } from "reka-ui";
import { buttonVariants } from ".";

const props = defineProps({
  as: { type: null, default: 'button' },
  asChild: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  class: { type: null, required: false }
});
</script>

<template>
  <Primitive
    data-slot="button"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
