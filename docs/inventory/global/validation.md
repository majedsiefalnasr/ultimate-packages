# Global inventory validation

Owner review: required. Generated from authored inputs; edit those inputs, not this file. A passing reconciliation means every discovered identity and reference resolves to authored inventory evidence. It does not assert a defect-free product, and closure requires owner review.

Coverage input: scripts/inventory/package-coverage.json; revision 81ed699f

Scoped batch validation: run

Batch inputs:
- scripts/inventory/ai.json: ticket #156; scope ai-156; revision 84805a04a25704f0d942148892b9935d41c89b7c
- scripts/inventory/angular-actions.json: ticket #107; scope angular-actions; revision 4ad393323af126b83c46c40a53d34cdadf2070ef
- scripts/inventory/angular-choice-range.json: ticket #113; scope angular-choice-range; revision d2e8101bf77e8e440c7166211ad5eae0e0ac6df8
- scripts/inventory/angular-collection-presentation.json: ticket #134; scope angular-collection-presentation; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/angular-core.json: ticket #148; scope angular-core-148; revision fb15ca0ee9bc50d3a84b4b19367af0dd192359ac
- scripts/inventory/angular-disclosure-steps.json: ticket #128; scope angular-disclosure-steps; revision fcd2e02d28e0b9a678262d4731bb7ae31732d574
- scripts/inventory/angular-feedback.json: ticket #140; scope angular-feedback; revision c531e881dfa14e18449553ecfe45b0ab17d3210a
- scripts/inventory/angular-media-containers.json: ticket #137; scope angular-media-containers; revision cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6
- scripts/inventory/angular-menu-navigation.json: ticket #125; scope angular-menu-navigation; revision e661ec4539053d25da39594441225520e5dd07ab
- scripts/inventory/angular-numeric-date-color-file.json: ticket #119; scope angular-numeric-date-color-file; revision 73cc77945ad2e4213695c2d140166822dc1ad12c
- scripts/inventory/angular-option-selection.json: ticket #116; scope angular-option-selection; revision f8fc98fc26ad56886dfe9af8714fb6b6f66e78a7
- scripts/inventory/angular-overlays-notifications.json: ticket #122; scope angular-overlays-notifications; revision 02810e3a8a6ca5ccf75eb596a1ddccdb86257c9b
- scripts/inventory/angular-table-viewport.json: ticket #131; scope angular-table-viewport; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/angular-text-entry.json: ticket #110; scope angular-text-entry; revision 07ced02e76e763352e806fc53006976eb0f6259d
- scripts/inventory/cli.json: ticket #154; scope cli-154; revision bad6cc52abbeaa74c357dfcdc0a5a4338c781a86
- scripts/inventory/component-schema.json: ticket #152; scope component-schema-152; revision 0fa34369fc5b6f0a424f932d91ef6b560a294236
- scripts/inventory/data-motion-primitives.json: ticket #147; scope data-motion-primitives-147; revision 75271f0ae536520ff9179f33b4309e7950b7aab4
- scripts/inventory/mcp.json: ticket #155; scope mcp-155; revision 642e7e27996c29dc6cca009f93a84e76ee74c9b8
- scripts/inventory/metadata-registry.json: ticket #153; scope metadata-registry-153; revision e60b2f03cdcfdbd8bf6cdb999a346858ad619718
- scripts/inventory/react-actions.json: ticket #108; scope react-actions; revision c7a8d706e9ebfb22ebf6cc6635a77819cce95576
- scripts/inventory/react-choice-range.json: ticket #114; scope react-choice-range; revision 8d8d52094058993d3ca29823d1c2cd922805570e
- scripts/inventory/react-collection-presentation.json: ticket #135; scope react-collection-presentation; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/react-core.json: ticket #149; scope react-core-149; revision fb15ca0ee9bc50d3a84b4b19367af0dd192359ac
- scripts/inventory/react-disclosure-steps.json: ticket #129; scope react-disclosure-steps; revision ac4fc25447d81612681a7a7a075ce569e0490498
- scripts/inventory/react-feedback.json: ticket #141; scope react-feedback; revision e3add69e5d93fea60f7a0d3f96ca986c0c8c9738
- scripts/inventory/react-media-containers.json: ticket #138; scope react-media-containers; revision cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6
- scripts/inventory/react-menu-navigation.json: ticket #126; scope react-menu-navigation; revision af79b2ec8b18681f0163d9ede0beba387c462258
- scripts/inventory/react-numeric-date-color-file.json: ticket #120; scope react-numeric-date-color-file; revision e99d41249677496cf6c531576dd6e1c181544883
- scripts/inventory/react-option-selection.json: ticket #117; scope react-option-selection; revision 7845cf0f945bc5526061884f531fa9a01ba4757d
- scripts/inventory/react-overlays-notifications.json: ticket #123; scope react-overlays-notifications; revision 7b296258f469ba37ed2367cafbf3f2dbf95398f0
- scripts/inventory/react-table-viewport.json: ticket #132; scope react-table-viewport; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/react-text-entry.json: ticket #111; scope react-text-entry; revision c49aa4e6906a9d72a1893b3fc006fce55489d0b7
- scripts/inventory/root-files.json: ticket #157; scope root-files-157; revision 70b74575698fb77a72a18022b91181c66df41484
- scripts/inventory/shared-component-styles.json: ticket #146; scope shared-component-styles-146; revision 54f81ae85b0cfe3583541471bd4114fe8d8d7bac
- scripts/inventory/styled-runtime.json: ticket #145; scope styled-runtime-145; revision fb15ca0ee9bc50d3a84b4b19367af0dd192359ac
- scripts/inventory/theme-contract.json: ticket #151; scope theme-contract-151; revision bced8db5905c1e1f38463c585063e110a93624ca
- scripts/inventory/uix-utils-dom.json: ticket #143; scope uix-utils-dom-143; revision 41e8047c4ed60eed2789c89c1bb67b27469cd039
- scripts/inventory/uix-utils-values.json: ticket #144; scope uix-utils-values-144; revision 7a06beb32487f04ccd84a765f7722ac606825c74
- scripts/inventory/vue-actions.json: ticket #109; scope vue-actions; revision 37aa7ce8525c6f1622127eb1735ec41beb4096c5
- scripts/inventory/vue-choice-range.json: ticket #115; scope vue-choice-range; revision 638b5a660b62be5b39a9402db09bccc2a9e9d2e4
- scripts/inventory/vue-collection-presentation.json: ticket #136; scope vue-collection-presentation; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/vue-core.json: ticket #150; scope vue-core-150; revision fb15ca0ee9bc50d3a84b4b19367af0dd192359ac
- scripts/inventory/vue-disclosure-steps.json: ticket #130; scope vue-disclosure-steps; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/vue-feedback.json: ticket #142; scope vue-feedback; revision fdd42818185ed77ae0c025f732310672581c1cea
- scripts/inventory/vue-media-containers.json: ticket #139; scope vue-media-containers; revision cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6
- scripts/inventory/vue-menu-navigation.json: ticket #127; scope vue-menu-navigation; revision c15f80a751deffcf91566d7a4353d95d73548589
- scripts/inventory/vue-numeric-date-color-file.json: ticket #121; scope vue-numeric-date-color-file; revision 3143b1f248e72addb28087e65a31014466c5969d
- scripts/inventory/vue-option-selection.json: ticket #118; scope vue-option-selection; revision ba145d8cfc110bae18e4787a1242d51e38da9cd1
- scripts/inventory/vue-overlays-notifications.json: ticket #124; scope vue-overlays-notifications; revision ce6cb351653cbbb19cc0b0246942082dd0aff73d
- scripts/inventory/vue-table-viewport.json: ticket #133; scope vue-table-viewport; revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d
- scripts/inventory/vue-text-entry.json: ticket #112; scope vue-text-entry; revision 849ec35cc57b459cf1a6fb24f83b24d4beff559a

Result: global reconciliation passed

Historical (not canonical):
- scripts/inventory/pilot-sample.json#angular.button: superseded by scripts/inventory/angular-actions.json#angular.button
- scripts/inventory/pilot-sample.json#react.button: superseded by scripts/inventory/react-actions.json#react.button
- scripts/inventory/pilot-sample.json#shared.button-style: no canonical counterpart
- scripts/inventory/pilot-sample.json#vue.button: superseded by scripts/inventory/vue-actions.json#vue.button
