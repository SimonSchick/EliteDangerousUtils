import { EDLogReader } from './../src/EDLog/EDLogReader';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Validator } from 'jsonschema';

import { buildGenerator, getProgramFromFiles } from 'typescript-json-schema';

function run() {

    const program = getProgramFromFiles([join(__dirname, '../src/EDLog/events.ts')], {
        strictNullChecks: true
    });

    const generator = buildGenerator(program, {
        required: true,
        noExtraProps: true,
        // topRef: true,
    });

    const schema = generator!.getSchemaForSymbols(generator!.getUserSymbols());

    const raw = new EDLogReader().read();

    const validator = new Validator();
    validator.addSchema(schema, '/Events');
    raw.forEach(r => {
        // False positiv
        if (r.event === 'Materials' || r.event === 'Loadout' || r.event === 'Scan') {
            return;
        }
        const interfaceName = `I${r.event}`;
        const res = validator.validate(r, { $ref: `/Events#/definitions/${interfaceName}` }, {
            allowUnknownAttributes: false,
        });
        if (!res.valid || res.errors.length > 0) {
            console.log('Invalid schema', r, res.errors);
        }
    });
}
run();
