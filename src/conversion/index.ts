import {
  SimpleDate,
  rdFromEthiopic,
  ethiopicFromRd,
  rdFromGeregorian,
  geregorianFromRd,
} from "./core";

export function ethiopicToGregorian(date: SimpleDate) {
  return geregorianFromRd(rdFromEthiopic(date));
}

export function gregorianToEthiopic(date: SimpleDate) {
  return ethiopicFromRd(rdFromGeregorian(date));
}
