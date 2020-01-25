import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-invocation-chain-builder',
  templateUrl: './invocation-chain-builder.component.html',
  styleUrls: ['./invocation-chain-builder.component.scss']
})
export class InvocationChainBuilderComponent implements OnInit {

  constructor(private storage: StorageService) { }

  ngOnInit() {
  }

}
