export class IcsTransformer {
    transformVCalendar(cal: VCalendar) {
        let calendar = 'BEGIN:VCALENDAR\n';
        calendar += this.getKeysAndValues<VCalendar>(cal, ['events']);
        cal.events.forEach(ev => calendar += this.transformVEvent(ev));
        calendar += 'END:VCALENDAR\n'
        return calendar;
    }

    transformVEvent(ev: VEvent) {
        let event = 'BEGIN:VEVENT\n';
        event += this.getKeysAndValues<VEvent>(ev);
        event += 'END:VEVENT\n'
        return event;
    }

    private getKeysAndValues<T>(ev: T, filterKeys?: string[]) {
        return (Object.keys(ev).filter(k => !filterKeys?.includes(k)) as (keyof T)[]).reduce((vstring: string, key: keyof T) => 
        vstring += `${key}:${(ev[key] instanceof Date) ? this.transformDate((ev[key]) as any as Date) : ev[key]}\n`, '');
    }

    transformDate(date: Date) {
        return date.toISOString().replaceAll(/[^0-9TZ]+/g,'')
    }
}

interface VCalendar {
    /**
      * Ex: Sonarr TV Schedule
      */
    NAME: string;
    /**
      * Ex: -//sonarr.tv//Sonarr//EN
      */
    PRODID: string;
    /**
      * Ex: 2.0
      */
    VERSION: number;
    /**
      * Ex: Sonarr TV Schedule
      */
    'X-WR-CALNAME': string;
    events: VEvent[];
}

interface VEvent {
    /**
      * Ex: CATEGORIES:Disney+
      */
    CATEGORIES: string
    /**
      * Ex: DESCRIPTION:Newlywed couple Wanda and Vision host the Harts for dinner.
      */
    DESCRIPTION: string
    /**
      * Ex: DTEND:20210115T083000Z
      */
    DTEND: Date
    /**
      * Ex: DTSTAMP:20210120T130452Z
      */
    DTSTAMP: Date
    /**
      * Ex: DTSTART:20210115T080000Z
      */
    DTSTART: Date
    /**
      * Ex: SEQUENCE:0
      */
    SEQUENCE: string
    /**
      * Ex: STATUS:Confirmed|Tentative
      */
    STATUS: 'Confirmed'|'Tentative'
    /**
      * Ex: SUMMARY:WandaVision - 1x01 - Episode 1
      */
    SUMMARY: string
    /**
      * Ex: UID:NzbDrone_episode_1417
      */
    UID: string
}