import Stric from "../..";

// This is a shorthand call, use all the options in stric.config.json
// Options specified in the code will be merged with all options in the config file
await Stric.boot({ root: import.meta.dir });