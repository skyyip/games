// Older multi-purchase regression flows explicitly acknowledge each receipt.
export async function dismissPurchase(page){
 const dialog=page.locator('#purchase-dialog');if(!await dialog.isVisible())return;
 await page.locator('#purchase-continue').evaluate(button=>button.click());
 await dialog.waitFor({state:'hidden'});
}
export async function buyAndContinue(page,selector){
 await dismissPurchase(page);await page.locator(selector).click();await dismissPurchase(page);
}
