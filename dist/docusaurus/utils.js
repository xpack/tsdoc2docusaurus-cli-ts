export function formatDuration(millis) {
    if (millis < 1000) {
        return `${String(millis)} ms`;
    }
    else if (millis < 100000) {
        return `${(millis / 1000).toFixed(1)} sec`;
    }
    else {
        return `${(millis / 60000).toFixed(1)} min`;
    }
}
export function pluralise(name) {
    const plurals = {
        Class: 'Classes',
        Interface: 'Interfaces',
        Function: 'Functions',
        Variable: 'Variables',
        'Type alias': 'Type Aliases',
        TypeAlias: 'Type Aliases',
        Namespace: 'Namespaces',
        Enum: 'Enums',
        Method: 'Methods',
        Property: 'Properties',
        PropertySignature: 'PropertySignatures',
        IndexSignature: 'IndexSignatures',
        Constructor: 'Constructors',
        CallSignature: 'CallSignatures',
        GetSignature: 'GetSignatures',
        SetSignature: 'SetSignatures',
    };
    if (Object.prototype.hasOwnProperty.call(plurals, name)) {
        return plurals[name];
    }
    console.warn(`No plural for ${name}, using default.`);
    return name + 's?';
}
export function filterFileName(name) {
    let filteredName = name == 'index' ? '$index' : name;
    if (name.startsWith('_')) {
        filteredName = `$${filteredName}$`;
    }
    return filteredName;
}
//# sourceMappingURL=utils.js.map