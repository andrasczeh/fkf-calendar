import { serve } from "https://deno.land/std@0.83.0/http/server.ts";
import * as React from "https://esm.sh/react@18";
import { renderToString } from "https://esm.sh/preact-render-to-string@5.1.19?deps=preact@10.5.15";

import { IcsTransformer } from "./ics/ics.ts";
import { FkfSelectiveDateRetriever } from "./fkf/fkf.ts";

const fkf = new FkfSelectiveDateRetriever();
const ics = new IcsTransformer();


// await getCal();

const s = serve({ port: 8001 });
console.log("http://localhost:8000/");
for await (const req of s) {
  if (req.url.endsWith('/fkf.ics')) {
    const headers = new Headers();
    headers.append('cache-control', 'no-cache, no-store, must-revalidate, max-age=0');
    // headers.append('content-encoding', 'gzip');
    headers.append('content-type', 'text/calendar; charset=utf-8');
    // new Blob((await getCal()),'').
    req.respond({headers: headers, body: await getCal()});
  } else {
    const headers = new Headers();
    headers.append('content-type', 'text/html; charset=utf-8');
    const page = (
      <div>
        <h1>Current time</h1>
        <p>{new Date().toLocaleString()}</p>
      </div>
    );
    const html = renderToString(page);
    req.respond({ headers: headers, body: `<!DOCTYPE html>
    <html>
    <body>
       To load ics navigate <a href="./fkf.ics">here!</a>
       Configuration options coming soon!
       ${page}
    </body>
    </html>` });
  }
}

async function getCal() {
  const date = await fkf.getCurrentDate();
  return ics.transformVCalendar({
    NAME: 'FKF Szelektív naptár',
    PRODID: '-//cd9293//FKF//HU',
    VERSION: 2.0,
    "X-WR-CALNAME": 'FKF Szelektív naptár',
    events: [
      {
        CATEGORIES: 'FKF Szelektiv',
        DESCRIPTION: 'Ma viszik a szelektív kukákat',
        DTEND: date,
        DTSTAMP: date,
        DTSTART: date,
        SEQUENCE: '0',
        STATUS: 'Confirmed',
        SUMMARY: 'Szelektiv',
        UID: 'FKF_' + (date).toISOString()
      }
    ]
  });
}
