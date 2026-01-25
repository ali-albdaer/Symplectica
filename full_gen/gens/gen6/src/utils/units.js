// Unit helpers.

const AU_METERS = 149_597_870_700;
const KM_METERS = 1000;

export const Units = {
  AU_METERS,

  metersToAU(m) {
    return m / AU_METERS;
  },

  kmToAU(km) {
    return (km * KM_METERS) / AU_METERS;
  },

  auToMeters(au) {
    return au * AU_METERS;
  }
};
