import {Dialog, SimpleCheckbox, SingleHandleSlider} from "VizabiSharedComponents";
import {decorate, computed, runInAction} from "mobx";

/*
 * billionaire dialog
 */
class BillyDialog extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/billy"></span>
        </div>
    
        <div class="vzb-dialog-content">

            <div class="vzb-billy-show"></div>
            <div class="vzb-billy-howmany"></div>
            <div class="vzb-billy-count"></div>

        </div>
      </div>
    `;
    config.subcomponents = [
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-billy-show",
        options: {
          checkbox: "showBilly",
          submodel: "root.ui.chart"
        }
      },
      {
        type: SingleHandleSlider,
        placeholder: ".vzb-billy-howmany",
        options: {
          domain: [1, 5, 10, 50, 100, 500, 1000],
          snapValue: true,
          value: "howManyBilly",
          submodel: "root.ui.chart"
        }
      }
    ];

    super(config);
  }

  setup(options) {
    super.setup(options);
    const _this = this;
    this.DOM.slider = this.element.select(".vzb-billy-howmany");
    this.DOM.count = this.element.select(".vzb-billy-count")
      .on("click", () => {this.root.ui.chart.billyFaces = !this.root.ui.chart.billyFaces;});

    this.defaultHowManyBilly = this.root.ui.chart.howManyBilly;
    this.defaultBillyFaces = this.root.ui.chart.billyFaces;
  }

  get MDL() {
    return {

    };
  }  

  draw(){
    this.localise = this.services.locale.auto();
    super.draw();

    this.addReaction(this.updateVisibility);
    this.addReaction(this.updateCount);
    this.addReaction(this.setModel);
  }

  setModel(){
    const showBilly = this.root.ui.chart.showBilly;  
    runInAction(() => {
      this.model.encoding.mu.config.scale.domain[1] = showBilly ? 100000000 : 500;

      //take the bily config out of stash and apply it, so that the data starts loading
      //resetting back to null then for cleaning URL state
      const marker = this.root.model.markers["billy"];
      const encs = ["x", "name", "slices"];
      if (showBilly)
        for (let enc of encs)
          marker.encoding[enc].data.config.concept = marker.encoding[enc].data.config.stash;
      else
        for (let enc of encs)
          marker.encoding[enc].data.config.concept = null;

      //for cleaning URL state
      if (!showBilly){
        this.root.ui.chart.howManyBilly = this.defaultHowManyBilly;
        this.root.ui.chart.billyFaces = this.defaultBillyFaces; 
      }
    });
  }

  updateVisibility() {
    const showBilly = this.root.ui.chart.showBilly;  
    this.DOM.slider.classed("vzb-hidden", !showBilly);
    this.DOM.count.classed("vzb-hidden", !showBilly);
    this.findChild({type: "SingleHandleSlider"})._updateSize();
    this.findChild({type: "SingleHandleSlider"})._updateView();
  }

  updateCount(){
    const showBilly = this.root.ui.chart.showBilly; 
    const howMany = this.root.ui.chart.howManyBilly;
    if(showBilly) this.DOM.count.text(Math.round(howMany));
  }

}

const decorated = decorate(BillyDialog, {
  "MDL": computed
});
Dialog.add("billy", decorated);
export { decorated as BillyDialog };
