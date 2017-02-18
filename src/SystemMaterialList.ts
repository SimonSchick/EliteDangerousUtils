import {
    FactionState,
    Allegiance,
} from './EDLog';

export const byAllegiance: Partial<{
    [state in Allegiance]: string[]
}> = {
    Empire: ['Imperial Shielding']
};

export const byState: Partial<{
    [state in FactionState]: string[]
}> = {
    Boom: [
        'Heat Dispersion Plate',
        'Mechanical Equipment',
        'Compound Shielding',
        'Exquisite Focus Crystals',
        'Heat Dispersion Plate',
        'Mechanical Equipment',
        'Phase Alloys',
        'Proto Heat Radiators',
        'Proto Light Alloys',
        'Proto Radiolic Alloys',
        'Shield Emitters',

        'Aberrant Shield Pattern Analysis',
        'Atypical Disrupted Wake Echoes',
        'Classified Scan Fragment',
        'Inconsistent Shield Soak Analysis',
        'Irregular Emission Data',
        'Security Firmware Patch',
        'Strange Wake Solutions',
        'Tagged Encryption Codes',
        'Unexpected Emission Data',
        'Unidentified Scan Archives',
        'Unusual Encrypted Files',
    ],
    Election: ['Galvanising Alloys', 'Modified Consumer Firmware', 'Unexpected Emission Data'],
    Retreat: ['Compound Shielding', 'Security Firmware Patch'],
    CivilUnrest: ['Improvised Components'],
    CivilWar:  ['Modified Consumer Firmware'],
    War: ['Military Supercapacitors', 'Military Grade Alloys', 'Military Supercapacitors'],
    Outbreak: ['Pharmaseutical Isolators', 'Polymer Capacitors']
}

export const byStateAllegiance: Partial<{
    [state in FactionState]: Partial<{
        [allegiance in Allegiance]: string[]
    }>}> = {
    War: {
        Empire: ['Imperial Shielding'],
        Federation: ['Core Dynamics Composites']
    },
    Boom: {
        Federation: ['Core Dynamics Composites']
    },
    Election: {
        Federation: ['Proprietary Composites'],
    },
}

export const security = {
    low: ['Configurable Components', 'High Density Composites', 'Mechanical Components'],
    medium: <string[]>[],
    high: [
        'Chemical Distillery',
        'Chemical Processors', 
        'Compound Shielding', 
        'Focus Crystals',
        'Refined Focus Crystals',
        'Shielding Sensors'
    ],
};

export const government = {
    Anarchy: ['Conductive Ceramics', 'Conductive Components', 'Electrochemical Arrays', 'Heat Exchangers']
}