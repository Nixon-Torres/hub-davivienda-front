import { TestBed } from '@angular/core/testing';

import { AsideFoldersService } from './aside-folders.service';

describe('AsideFoldersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AsideFoldersService = TestBed.get(AsideFoldersService);
    expect(service).toBeTruthy();
  });
});
