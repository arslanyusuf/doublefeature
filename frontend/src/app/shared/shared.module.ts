import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClickOutsideDirective } from './dropdown/directives/clickOutside.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ClickOutsideDirective],
  exports: [ClickOutsideDirective, CommonModule],
})
export class SharedModule {}
