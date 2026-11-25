export const style = /*css*/ `
    .u-knob-range {
        fill: none;
        transition: stroke 0.1s ease-in;
    }

    .u-knob-value {
        animation-name: u-knob-dash-frame;
        animation-fill-mode: forwards;
        fill: none;
    }

    .u-knob-text {
        font-size: 1.3rem;
        text-align: center;
    }

    .u-knob svg {
        border-radius: 50%;
        outline-color: transparent;
        transition:
            background dt('knob.transition.duration'),
            color dt('knob.transition.duration'),
            outline-color dt('knob.transition.duration'),
            box-shadow dt('knob.transition.duration');
    }

    .u-knob svg:focus-visible {
        box-shadow: dt('knob.focus.ring.shadow');
        outline: dt('knob.focus.ring.width') dt('knob.focus.ring.style') dt('knob.focus.ring.color');
        outline-offset: dt('knob.focus.ring.offset');
    }

    @keyframes u-knob-dash-frame {
        100% {
            stroke-dashoffset: 0;
        }
    }
`;
