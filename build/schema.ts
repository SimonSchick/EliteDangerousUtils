import { EDLogReader } from './../src/EDLog/EDLogReader';
import { join } from 'path';
import { Validator } from 'jsonschema';

import { buildGenerator, getProgramFromFiles } from 'typescript-json-schema';
import { directory } from '../src/EDLog/directory';

function run() {
    const file = join(__dirname, '../src/EDLog/events.ts');
    const program = getProgramFromFiles([file], {
        strictNullChecks: true,
    });

    const generator = buildGenerator(program, {
        required: true,
        noExtraProps: true,
        // topRef: true,
    });

    const schema = generator!.getSchemaForSymbols(generator!.getMainFileSymbols(program));

    const raw = new EDLogReader().read(directory());

    const validator = new Validator();
    const known = new Set<string>();
    validator.addSchema(schema, '/Events');
    let errors = 0;
    raw.forEach(r => {
        // False positiv
        if (r.event === 'Scan') {
            return;
        }
        const interfaceName = `I${r.event}`;
        const res = validator.validate(r, { $ref: `/Events#/definitions/${interfaceName}` }, {
            allowUnknownAttributes: false,
        });
        if (!res.valid || res.errors.length > 0) {
            res.errors.forEach(e => {
                if (known.has(e.message)) {
                    return;
                }
                if (e.property.startsWith('instance.Modules[')) {
                    return;
                }
                errors++;
                console.log('Invalid schema', r, res.errors);
                known.add(e.message)
            });

            if (res.errors.some(e => !known.has(e.message))) {
            }
        }
    });
    console.log('errors', errors);
}
run();
