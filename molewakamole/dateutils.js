class DateUtils {
    static now() {
        const d = new Date();
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d;
    }

    static fromMillis(millis) {
        return new Date(millis);
    }

    static format(d, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = format;
        result = result.replace('yyyy', d.getFullYear().toString().padStart(4, '0'));
        result = result.replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'));
        result = result.replace('dd', d.getDate().toString().padStart(2, '0'));
        result = result.replace('hh', d.getHours().toString().padStart(2, '0'));
        result = result.replace('mm', d.getMinutes().toString().padStart(2, '0'));
        result = result.replace('ss', d.getSeconds().toString().padStart(2, '0'));
        result = result.replace('millis', d.getMilliseconds().toString().padStart(3, '0'));
        return result;
    }

    static formatLocal(d, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        const dateutc = new Date(d.getTime());
        dateutc.setMinutes(dateutc.getMinutes() - dateutc.getTimezoneOffset());
        return DateUtils.format(dateutc, format);
    }

    static formatMillis(ms) {
        const _24HOURS = 3600000; // 60 * 60 * 1000
        const hh = Math.floor(ms / _24HOURS);
        const mmss = DateUtils.format(DateUtils.fromMillis(ms % _24HOURS), "mm:ss");
        console.log(hh, mmss, ms, ms / _24HOURS);
        return hh + ":" + mmss;
    }

    static fromLocal(dateStr, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = new Date();
        result.setFullYear(parseInt(dateStr.substr(format.indexOf('yyyy'), 4)));
        result.setMonth(parseInt(dateStr.substr(format.indexOf('MM'), 2)) - 1);
        result.setDate(parseInt(dateStr.substr(format.indexOf('dd'), 2)));
        result.setHours(parseInt(dateStr.substr(format.indexOf('hh'), 2)));
        result.setMinutes(parseInt(dateStr.substr(format.indexOf('mm'), 2)) + result.getTimezoneOffset());
        result.setSeconds(parseInt(dateStr.substr(format.indexOf('ss'), 2)));
        result.setMilliseconds(parseInt(dateStr.substr(format.indexOf('millis'), 3)));
        return result;
    }

    static fromUTC(dateStr, format = 'yyyy-MM-ddThh:mm:ss.millisZ') {
        let result = new Date();
        result.setFullYear(parseInt(dateStr.substr(format.indexOf('yyyy'), 4)));
        result.setMonth(parseInt(dateStr.substr(format.indexOf('MM'), 2)) - 1);
        result.setDate(parseInt(dateStr.substr(format.indexOf('dd'), 2)));
        result.setHours(parseInt(dateStr.substr(format.indexOf('hh'), 2)));
        result.setMinutes(parseInt(dateStr.substr(format.indexOf('mm'), 2)));
        result.setSeconds(parseInt(dateStr.substr(format.indexOf('ss'), 2)));
        result.setMilliseconds(parseInt(dateStr.substr(format.indexOf('millis'), 3)));
        return result;
    }

    // Operations
    static addDays(d, days) {
        const result = new Date(d.getTime());
        result.setDate(result.getDate() + days);
        return result;
    }

    // Whitenova
    static whitenovaPeriod(offset = 0) {
        console.log(offset)
        const REF = DateUtils.fromUTC("2022-12-30T09:00:00.000Z");
        const PERIOD = 14;
        const now = DateUtils.addDays(DateUtils.now(), - PERIOD * offset);
        const time_between = now - REF;
        const periods = Math.floor(time_between / (PERIOD * 24 * 60 * 60 * 1000));
        const start = DateUtils.addDays(REF, periods * PERIOD);
        const end = DateUtils.addDays(start, PERIOD);

        const days = [];
        for (let i = 0; i < PERIOD; i++)
            days.push(DateUtils.formatLocal(DateUtils.addDays(start, i), "dd-MM"));
        return {
            start: start,
            end: end,
            days: days
        };
    }
}

module.exports = DateUtils;