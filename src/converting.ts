import {
  Ken,
  fixedFromEthiopic,
  ethiopicFromFixed,
  fixedFromGeregorian,
  geregorianFromFixed,
} from "./core";

export function toGC(ken: Ken) {
  const rd = fixedFromEthiopic(ken);

  return geregorianFromFixed(rd);
}
export function toEE(ken: Ken) {
  const rd = fixedFromGeregorian(ken);
  return ethiopicFromFixed(rd);
}
