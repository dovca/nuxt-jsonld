import Vue from 'vue';
import mergeHead, { getJsonLdHeadObject } from './mergeHead';

type JsonldMixin = {
  created?: () => void;
  beforeCreate?: () => void;
};

export default (): JsonldMixin => {
  // @ts-ignore
  const isGenerating = process.server === undefined && process.client === undefined;
  return isGenerating
    ? {
        // When generating static site, we need to use `created` to access `this` of the component.
        created(this: Vue) {
          if (this.$options && typeof this.$options.jsonld === 'function') {
            const vApp = this.$meta().addApp('nuxt-jsonld');
            const jsonld = getJsonLdHeadObject(this, this.$options.jsonld);
            if (jsonld !== null) {
              // @ts-ignore
              vApp.set(jsonld);
            }
          }
        },
      }
    : {
        // On server and client side, we need to use beforeCreate to update head function before it is called
        beforeCreate() {
          if (this.$options && typeof this.$options.jsonld === 'function') {
            const originalHead = this.$options.head ?? this.$options.computed?.$metaInfo;
            this.$options.head = () => {
              return mergeHead.call(this, originalHead);
            };
          }
        },
      };
};
