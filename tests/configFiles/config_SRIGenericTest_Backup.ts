const dethubUsername = process.env.DETHUB_USERNAME;
const dethubPassword = process.env.DETHUB_PASSWORD;
const dethubUrl =
  process.env.DETHUB_QA_URL_NEW ||
  process.env.DETHUB_QA_URL_new ||
  process.env.DETHUB_QA_URL ||
  'https://det-sri-test-core-api.symphonyai.dev/smc2/home';

export const config = {
  //Project Name
  projectName: 'SRI_Generic_Test',
  
  //Login details
  url: dethubUrl,
  username: dethubUsername || 'admin',
  password: dethubPassword || 'password',
  titleText: 'SymphonyAI: SRI',
  invalidLoginAlertText: "Login authentication failed",

  //Scenario Manager
  smChild: "Scenario Manager",
  smChildPageTitle: "Configurations",
  smConfig: "Scenario Manager",
  smCreateConfigBtn: "Create configuration",
  smConfigPageTitle: "Configuration",
  newConfigSuccessMsg: "New configuration",
  smConfigCopiedSuccessMsg: "Configuration Copied Successfully",
  smConfigLoadedSuccessMsg: "You are now viewing this configuration.",
  smConfigStartEditBtn: "Start Editing",
  smConfigSavedSuccessMsg: "Configuration saved",
  smValidConfigMsg: "Valid configuration",
  smSetToProdSuccessMsg: "Configuration productionised",
  smDeleteConfigMsg: "Configuration deleted",
  smProfileTab: "Profiling",
  smModelsTab: "Models",
  smModelFieldPanel: "Model Fields",
  smBulkOperationDomain: "AML - Correspondent Banking",
  smBulkOperationSuccessMsg: "Workflow action completed",

  //Batch Monitor
  bmMenuBtn: "Menu",
  bmAdministration: "Administration",
  bmProcessMonitor: "Batch Process Monitor",
  bmProcessesHeading: "Batch Processes",
  bmGroupView: "Batch Processes - Group View",
  bmSearchBtn: "Search",
  bmNoRowsFoundText: "no rows found",
  bmGroupNameLabel: "Group Name",
  bmStatusLabel: "Status",
  bmCreatedAtLabel: "Created at",
  bmCompletedAtLabel: "Completed at",
  bmBatchIdLabel: "Batch Id",
  bmBatchNameLabel: "Batch Name",
  bmSearchBatchProcessesHeading: "Search Batch Processes",
  bmListBatchProcessesHeading: "List of Batch Processes",
  bmBatchProcessDetailsHeading: "Batch Process Details",
  bmDefaultGroupName: "BatchBridge",
  bmPreferredJobName: "CustomerBatchBridge",
  bmFallbackJobKeyword: "Customer",
  bmBatchTypeFallback: "BatchBridgeJob",
  bmInProgressWaitMs: 180000,
  bmCompletionWaitMs: 900000,
  bmRefreshWaitMs: 60000,
  bmMonitorPollIntervalMs: 5000,
  bmLifecycleTimeoutBufferMs: 120000,
  bmRequireInProgressLifecycle: false,
};
