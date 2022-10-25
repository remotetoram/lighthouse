import { LightHouseFlow } from "./workflows/login-flow";

let lightflow = new LightHouseFlow();
(async () => {
    await lightflow.auditSiteFlow();
})();