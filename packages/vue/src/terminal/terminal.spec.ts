import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { UTerminal } from "./index";
import { terminalEventBus } from "./terminal-event-bus";

describe("UTerminal", () => {
  afterEach(() => {
    terminalEventBus.emit("clear");
  });

  it("renders the welcome message when provided", () => {
    const wrapper = mount(UTerminal, { props: { welcomeMessage: "Welcome!" } });
    expect(wrapper.find(".u-terminal-welcome-message").text()).toBe("Welcome!");
  });

  it("submits a command on Enter, echoes it, and clears the input", async () => {
    const wrapper = mount(UTerminal, { attachTo: document.body });
    const input = wrapper.find(".u-terminal-prompt-value");
    await input.setValue("help");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.find(".u-terminal-command-value").text()).toBe("help");
    expect((input.element as HTMLInputElement).value).toBe("");
    wrapper.unmount();
  });

  it("does not submit an empty command", async () => {
    const wrapper = mount(UTerminal, { attachTo: document.body });
    const input = wrapper.find(".u-terminal-prompt-value");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.findAll(".u-terminal-command").length).toBe(0);
    wrapper.unmount();
  });

  it("emits a command event on the shared terminalEventBus", async () => {
    const wrapper = mount(UTerminal, { attachTo: document.body });
    const received: string[] = [];
    terminalEventBus.on("command", (cmd: unknown) => received.push(cmd as string));
    const input = wrapper.find(".u-terminal-prompt-value");
    await input.setValue("ls");
    await input.trigger("keydown", { key: "Enter" });
    expect(received).toEqual(["ls"]);
    wrapper.unmount();
  });

  it("renders a response published via terminalEventBus against the most recent command", async () => {
    const wrapper = mount(UTerminal, { attachTo: document.body });
    const input = wrapper.find(".u-terminal-prompt-value");
    await input.setValue("ls");
    await input.trigger("keydown", { key: "Enter" });
    terminalEventBus.emit("response", "file1.txt file2.txt");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-terminal-command-response").text()).toBe("file1.txt file2.txt");
    wrapper.unmount();
  });

  it("focuses the input on mount", () => {
    const wrapper = mount(UTerminal, { attachTo: document.body });
    const input = wrapper.find(".u-terminal-prompt-value").element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    wrapper.unmount();
  });
});
