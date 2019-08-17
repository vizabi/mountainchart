const { utils } = Vizabi;

const MCRobinHood = Vizabi.Class.extend({

  init(context) {
    this.context = context;

    this.meshEdgeTaxIndexes = [];
    //this.meshAdjustedIndexes = [];
    this.meshExtremePovetryIndex = 0;
    this.taxByPointers = {};
    this.taxSum = 0;
  },

  findMeshIndexes(mesh) {
    const _this = this.context;
    if (!_this.model.ui.chart.robinhood.enable) return;

    const extremePovetryLevel = _this.model.ui.chart.probeX;

    const rescaledMesh = this.rescaledMesh = mesh.map(d => _this._math.rescale(d));
    utils.forEach(rescaledMesh, (d, i) => {
      if (d > extremePovetryLevel) {
        this.meshExtremePovetryIndex = i;
        return false;
      }
    });

    const xTaxCopy = _this.model.ui.chart.robinhood.xTax.slice(0);
    
    let xTaxValue = xTaxCopy.pop();
    for(let i = mesh.length - 1; i > 0; i--) {
      if(rescaledMesh[i] < xTaxValue) {
        this.meshEdgeTaxIndexes[xTaxCopy.length] = i + 1;
        if(xTaxCopy.length === 0) break;
        xTaxValue = xTaxCopy.pop();
      }
    }

    //todo
    this.adjXTax = _this.model.ui.chart.robinhood.xTax.slice(0);
    this.adjYTax = _this.model.ui.chart.robinhood.yTax.slice(0);

  },

  adjustCached() {
    const _this = this.context;
    if (!_this.model.ui.chart.robinhood.enable) return;

    const rescaledMesh = this.rescaledMesh;
    const meshLength = rescaledMesh.length;


    this.taxByPointers = {};
    this.taxSum = 0;
    //adjust rich side
    _this.mountainPointers.forEach((d, i) => {
      const pKey = d.KEY();
      const cached = _this.cached[pKey];

      this.taxSum += this.taxByPointers[pKey] = this.meshEdgeTaxIndexes.reduce((tax, meshIndex, index, meshIndexArray) => {
        const nextMeshIndex = meshIndexArray[index + 1] || meshLength;
        for(let i = meshIndex; i < nextMeshIndex; i++) {
          tax += rescaledMesh[i] * cached[i].y * this.adjYTax[index];
          cached[i].y -= cached[i].y * this.adjYTax[index];
        }
        return tax;
      }, 0);
      
    });

    //adjust poor side
    const meshExtremePovetryIndex = this.meshExtremePovetryIndex;
    let taxSum = this.taxSum;
    for(let i = 0; i < meshExtremePovetryIndex; i++) {
      if (taxSum <= 0) break;

      utils.forEach(_this.mountainPointers, d => {
        const pKey = d.KEY();
        const cached = _this.cached[pKey];
        
        taxSum -= (rescaledMesh[meshExtremePovetryIndex] - rescaledMesh[i]) * cached[i].y;
        if (taxSum <= 0) return false;

        cached[meshExtremePovetryIndex].y += cached[i].y;
        cached[i].y = 0;


        // taxSum -= (rescaledMesh[i + 1] - rescaledMesh[i]) * cached[i].y;
        // if (taxSum <= 0) return false;

        // cached[i + 1].y += cached[i].y;
        // cached[i].y = 0;
      });

    }

  },

  redraw(options) {

  },

});

export default MCRobinHood;
