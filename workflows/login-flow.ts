import { join } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import dataContent from "../resources/data.json";
import {startFlow} from 'lighthouse/lighthouse-core/fraggle-rock/api.js';
import puppeteer from 'puppeteer';

export class LightHouseFlow {
  private currentDateTime = new Date().toISOString().replace(':','-').replace(':','-').replace('.','-');
  private reportFolder = join(process.cwd(), `Reports/${this.currentDateTime}`);
 
  async auditSiteFlow(): Promise<void> {
    await this.setup();
    let urls = await this.getUrls();
    await this.triggerLightHouseFlowAuditAndGetResults(urls);
  }

  async triggerLightHouseFlowAuditAndGetResults(
    testSource: {}[]
  ): Promise<void> {
   
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const flow = await startFlow(page, {name: 'Connectados - Login Flow'});
    await flow.navigate(testSource[0]["url"], {
      stepName: 'Welcome Page'
    });

    await flow.startTimespan({stepName: 'Login Operation'});
    await page.click("div[class='homePromoBox'] button:nth-child(1)");
    await flow.endTimespan();

    await flow.snapshot({stepName: 'Login Page'});
    await page.waitForSelector('#loginMobileNumber');

    await flow.startTimespan({stepName: 'Provide Credentials'});
    await page.type('#loginMobileNumber','916687605');
    await page.type('#loginPassword','123456');
    await page.click('div.submitButton button');
    await flow.endTimespan();

    await page.waitForSelector('nav.navbar.navbar-expand-md.loggedIn');
    await flow.snapshot({stepName: 'Home Page'});

    await browser.close();

  await writeFileSync(
       `${this.reportFolder}/${"FlowAudit"}.html`, await flow.generateReport()
    );
      
  }

  async setup(): Promise<void> {
    await this.makeReportDirectory();
  }

  async getUrls(): Promise<{}[]> {
    return dataContent.APP_NAME;
  }

  async makeReportDirectory(): Promise<void> {
    try {
      if (!(await existsSync(`${this.reportFolder}`))) {
        await mkdirSync(`${this.reportFolder}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

}