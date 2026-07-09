function ngAdd() {
  return (_tree, context) => {
    context.logger.info('');
    context.logger.info('ngx-liquid-glass is installed.');
    context.logger.info('');
    context.logger.info('Import the standalone directive where you use it:');
    context.logger.info('');
    context.logger.info("  import { NgxLiquidGlassDirective } from 'ngx-liquid-glass';");
    context.logger.info('');
    context.logger.info('Then add it to any element:');
    context.logger.info('');
    context.logger.info('  <div ngxLiquidGlass [lgIntensity]="\'vivid\'" [lgRadius]="24">');
    context.logger.info('    Any existing content');
    context.logger.info('  </div>');
    context.logger.info('');
  };
}

exports.ngAdd = ngAdd;
