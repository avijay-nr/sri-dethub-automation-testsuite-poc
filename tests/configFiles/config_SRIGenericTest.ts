const dethubUsername = process.env.DETHUB_USERNAME;
const dethubPassword = process.env.DETHUB_PASSWORD;
const dethubUrl = process.env.DETHUB_QA_URL;

export const config = {
  //Project Name
  projectName: 'SRI_Generic_Test',
  
  //Login details
  url: dethubUrl || 'https://det-sri-test-core-api.symphonyai.dev/smc2/home',
  username: dethubUsername || 'admin',
  password: dethubPassword || 'password',
  titleText: 'SymphonyAI: SRI',
  invalidLoginAlertText: "Login authentication failed",
};