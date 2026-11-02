import { handleError as normalizeHttpError } from "@dragorbit/core/api";
export function handleError(error) {
  const { displayMessage: _displayMessage, ...result } =
    normalizeHttpError(error);
  if (!error?.response?.data) result.fields = null;
  return result;
}
