import { Injectable } from '@angular/core';

interface Lock {
  name: string;
  coordinates: number[];
}

@Injectable({
  providedIn: 'root'
})

export class ChangeLockService {

  constructor() { }

  public locks: Lock[] = [
    {name: 'Mustola', coordinates: [28.316986, 61.062275]},
    {name: 'Mälkiä', coordinates: [28.304218, 61.070615]},
    {name: 'Soskua', coordinates: [28.400717, 61.039631]}
  ];
  public selectedLock: Lock = this.locks[0];
}
