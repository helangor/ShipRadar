import { Injectable } from '@angular/core';
import { Lock } from './models/lock';

@Injectable({
  providedIn: 'root'
})

export class ChangeLockService {

  public locks: Lock[] = [
    {name: 'Mälkiä', coordinates: [28.304218, 61.070615]},
    {name: 'Mustola', coordinates: [28.316986, 61.062275]},
    {name: 'Soskua', coordinates: [28.400717, 61.039631]}
  ];
  public selectedLock: Lock = this.locks[1];
  
  constructor()  {}
}
