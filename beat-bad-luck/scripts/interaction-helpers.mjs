// Existing gameplay regressions explicitly acknowledge new onboarding/exit UI.
export async function launchSkill(page,{native=true}={}){
 const button=page.locator('#kit-skill');if(native)await button.click();else await button.evaluate(e=>e.click());
 if(await page.locator('#skill-help-dialog').isVisible())await page.locator('#skill-help-go').evaluate(e=>e.click());
}
export async function endRitual(page){
 await page.locator('#quit').evaluate(e=>e.click());
 if(await page.locator('#quit-dialog').isVisible())await page.locator('#confirm-quit').evaluate(e=>e.click());
}
