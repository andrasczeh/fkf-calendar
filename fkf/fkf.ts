// https://dev.to/siddacool/deno-web-scrapper-3451
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.4-alpha/deno-dom-wasm.ts';

export interface DateFile {
        date?: string | Date;
        lastCheck?: string | Date;
}

export class FkfSelectiveDateRetriever {
        private readonly dateFilePath = "../config/fkf-date.json";
        private readonly url = "https://mohubudapest.hu/hulladeknaptar";
       
        async getCurrentDate(): Promise<Date> {
                const dateFile = await this.readDateFile();
                if (this.dateIsInThePast(dateFile) && this.lastCheckOlderThanXDays(4, dateFile)) {
                        dateFile.lastCheck = new Date();
                        dateFile.date = await this.getFkfDate();
                        await this.saveDateFile(dateFile);
                        console.log('Date updated successfully');
                } else {
                        console.log('Date is already up-to-date or within check period');
                }
                console.log(dateFile.date);
                return new Date(dateFile.date as string);
        }

        private dateIsInThePast(dateFile: DateFile) {
                const dateIsInPast = !!(!dateFile?.date || new Date(dateFile.date) < new Date());
                dateIsInPast ? console.log('Date is in past or non-existent') : null;
                return dateIsInPast;
        }
        
        private lastCheckOlderThanXDays(x: number, dateFile: DateFile): boolean {
                const now = new Date();
                const currentDay = now.getDate();
                const lastCheckOld = !!(!dateFile?.lastCheck || new Date(dateFile.lastCheck) < (now.setDate(currentDay - x), now));
                lastCheckOld ? console.log(`Last check older than ${x} days`) : null;
                return lastCheckOld;
        }
        
        private async readDateFile(): Promise<DateFile> {
                try {
                        const text = await Deno.readTextFile(this.dateFilePath);
                        return JSON.parse(text) as DateFile;
                } catch (error) {
                        console.log('No dateFile found, returning new object');
                        return {} as DateFile
                }
        }
        
        private async saveDateFile(file: DateFile) {
                const write = Deno.writeTextFile(this.dateFilePath, JSON.stringify(file));
        }
        
        private async getFkfDate() {
                const fkf = await fetch(this.url);
                console.log(await fkf.text());
        
                const districtFormData = new FormData();
                districtFormData.append('district', '1188');
                const publicPlaceFormData = new FormData();
                publicPlaceFormData.append('publicPlace', 'Kölcsey---utca');
                const houseNumberFormData = new FormData();
                houseNumberFormData.append('houseNumber', '101/A');
        
                await this.octoberRequest(fkf, "onSelectDistricts", "ajax/publicPlaces", districtFormData);
                await this.octoberRequest(fkf, "onSavePublicPlace", "ajax/houseNumbers", publicPlaceFormData);
                const dates = await this.octoberRequest(fkf, "onSearch", "ajax/calSearchResults", houseNumberFormData);
        
                const dateJson = await dates.json();
                console.log(dateJson);
                let selectiveDate = "";
                Object.values(dateJson).forEach((val) => {
                        const parsed = new DOMParser().parseFromString(val as string, 'text/html');
                        const date = parsed?.querySelector('.selective')?.parentElement?.parentElement?.children[1];
                        console.log(date);
                        selectiveDate = date?.textContent as string;
                });
                return selectiveDate;
        }
        
        private async octoberRequest(response: Response, handler: string, partials: string, formData: FormData): Promise<Response> {
                return await fetch(this.url, {
                        headers: {
                                cookie: response.headers.get('Set-Cookie'),
                                "x-october-request-handler": handler,
                                "x-october-request-partials": partials,
                                "x-requested-with": "XMLHttpRequest",
                        } as any, body: formData, method: 'POST'
                });
        }
}


