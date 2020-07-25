import { Validator } from 'jsonschema';
import { join } from 'path';
import { EDLogReader } from './../src/EDLog/EDLogReader';

import { buildGenerator, getProgramFromFiles } from 'typescript-json-schema';
import { directory } from '../src/EDLog/directory';

function run() {
  const file = join(__dirname, '../src/EDLog/events.ts');
  const program = getProgramFromFiles([file], {
    strictNullChecks: true,
  });

  const generator = buildGenerator(program, {
    noExtraProps: true,
    required: true,
    // topRef: true,
  });

  const schema = generator!.getSchemaForSymbols(generator!.getMainFileSymbols(program));

  const raw = new EDLogReader().read(directory());

  const validator = new Validator();
  const known = new Set<string>();
  validator.addSchema(<any>schema, '/Events');
  let errors = 0;
  let deduped = 0;
  raw.forEach(r => {
    // False positive
    if (r.event === 'Scan') {
      return;
    }
    const interfaceName = r.event;
    const res = validator.validate(r, { $ref: `/Events#/definitions/${interfaceName}` }, {
      allowUnknownAttributes: false,
    });
    if (!res.valid || res.errors.length > 0) {
      const unknownErrors = res.errors.filter(e => {
        if (known.has(e.message)) {
          deduped++;
          return false;
        }
        if (e.property.startsWith('instance.Modules[')) {
          return;
        }
        errors++;
        known.add(e.message);
        return true;
      });
      if (unknownErrors.length === 0) {
        return;
      }
      console.log('Invalid schema', r);
      console.log(unknownErrors.map(e => ({
        argument: e.argument,
        instance: e.instance,
        message: e.message,
        name: e.name,
        property: e.property,
      })));
    }
  });
  console.log('errors', errors);
  console.log('deduped', deduped);
}
run();
