    export const buildDeviceSettingReport = (deviceSetting: any[], fields: any,) => {
        const headers: string[] = [];
        const body: any[][] = [];
        if (fields.device) headers.push('Device');
        if (fields.key) headers.push('Key');
        if (fields.value) headers.push('Value');
        if (fields.description) headers.push('Description');

        deviceSetting.forEach((d, i) => {
            const row = [i + 1];
            if (fields.device) row.push(d?.device ?? '');
            if (fields.key) row.push(d?.key ?? '');
            if (fields.value) row.push(d?.value ?? '');
            if (fields.description) row.push(d?.description ?? '');
            body.push(row);
        });

        return { headers, body };
    }