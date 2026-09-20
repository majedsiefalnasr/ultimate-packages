<template>
  <div :class="cx('root')" @click="onClick">
    <div v-if="welcomeMessage" :class="cx('welcomeMessage')">{{ welcomeMessage }}</div>
    <div :class="cx('commandList')">
      <div v-for="(command, i) of commands" :key="command.text + i" :class="cx('command')">
        <span :class="cx('promptLabel')">{{ prompt }}</span>
        <span :class="cx('commandValue')">{{ command.text }}</span>
        <div :class="cx('commandResponse')" aria-live="polite">{{ command.response }}</div>
      </div>
    </div>
    <div :class="cx('prompt')">
      <span :class="cx('promptLabel')">{{ prompt }}</span>
      <input
        ref="input"
        v-model="commandText"
        :class="cx('promptValue')"
        type="text"
        autocomplete="off"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Terminal` component (see
// .vendor-extracted/vue/terminal/Terminal.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue on the component itself) — a text-based
// command-input/output-log display, not a standard form control. Real
// source's own command interpretation is fully pluggable: `Terminal` only
// echoes submitted commands and any response published on
// `terminalEventBus`; the actual command handler lives entirely in
// consuming application code.
//
// Deliberately excludes real source's up-arrow command-history recall
// (present in PrimeReact's own Terminal.js, absent from real PrimeVue's
// own Terminal.vue) — same "smaller surface than upstream" precedent as
// every sibling component; kept absent here to match real PrimeVue's own
// scope exactly rather than importing PrimeReact's extra behavior.
import { terminalEventBus } from "./terminal-event-bus";
import { createBaseTerminal } from "./BaseTerminal";

export default {
  name: "UTerminal",
  extends: createBaseTerminal(),
  inheritAttrs: false,
  data() {
    return {
      commandText: "",
      commands: [],
    };
  },
  mounted() {
    terminalEventBus.on("response", this.onResponse);
    terminalEventBus.on("clear", this.onClear);
    this.$refs.input.focus();
  },
  updated() {
    this.$el.scrollTop = this.$el.scrollHeight;
  },
  beforeUnmount() {
    terminalEventBus.off("response", this.onResponse);
    terminalEventBus.off("clear", this.onClear);
  },
  methods: {
    onClick() {
      this.$refs.input.focus();
    },
    onKeydown(event) {
      if (event.key === "Enter" && this.commandText) {
        this.commands.push({ text: this.commandText });
        terminalEventBus.emit("command", this.commandText);
        this.commandText = "";
      }
    },
    onResponse(response) {
      if (this.commands.length > 0) {
        this.commands[this.commands.length - 1].response = response;
      }
    },
    onClear() {
      this.commands = [];
    },
  },
};
</script>
