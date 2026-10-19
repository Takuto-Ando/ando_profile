import reference from "./data/ic-reference.json";
import { validateIcLibrary } from "./ic-reference";

export const bundledIcLibrary = validateIcLibrary(reference);
