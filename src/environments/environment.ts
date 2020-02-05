// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  URL_API:  'http://192.168.1.123:3000/api/',
  URL_SOCKET:  'http://192.168.1.123:3000/',
  // URL_SOCKET:  'http://localhost:3000',
  // URL_API:  'http://3.91.179.96:3000/api/',
  DRAFT_KEY: '5e068d1cb81d1c5f29b62977'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
