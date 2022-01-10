import { Resource } from 'resource-loader';
import type { Loader } from '@pixi/loaders';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import audioBufferSlice from './AudioBufferSlice';

import type { ILoaderResource } from './LoaderResource';

// import { ILoaderResource } from 'pixi.js';
// import { SOURCETYPE } from '../../Config';
// import { SoundResource } from './AuidoWave';

// export class ReverseAudio {
//   static async use(loaderResouce: ILoaderResource, next: (...args: any[]) => void) {
//     const resource = loaderResouce as SoundResource;
//     try {
//       const { custom } = resource.metadata;
//       const { isReverse = false, sourceType } = custom || {};
//       const isAudio = sourceType === SOURCETYPE.Audio || sourceType === SOURCETYPE.AudioFromVideo;
//       if (isReverse && isAudio && resource.sound) {
//         const { buffer } = resource.sound.media;
//         const { numberOfChannels } = buffer;

//         for (let i = 0; i < numberOfChannels; i++) {
//           Array.prototype.reverse.call(buffer.getChannelData(i));
//         }
//       }
//     } catch (e) {

//     }

//     next();
//   }
// }

/**
 * Loader plugin for slicing ArrayBuffer Of resource
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class SliceLoader
{
    /**
     * Handle SVG elements a text, render with SVGResource.
     */
    // public static add(): void
    // {
    //     Resource.setExtensionLoadType('svg', Resource.LOAD_TYPE.XHR);
    //     Resource.setExtensionXhrType('svg', Resource.XHR_RESPONSE_TYPE.TEXT);
    // }

    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static async use(this: Loader, resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        // create a new texture if the data is an mp3 object
        if (resource.data && (resource.type === Resource.TYPE.AUDIO || resource.extension === 'mp3'))
        {
            const slicedBuffer = await SliceLoader.sliceBuffer(this, resource);

            resource.data = slicedBuffer;
        }
        else
        {
            next();
        }
    }
    private static async sliceBuffer(loader: Loader, resource: ILoaderResource): Array<Buffer>
    {
        const { start, end } = loader;
        const buffer = resource.data;

        if (typeof start === 'undefined' || typeof end === 'undefined' || end === 0)
        {
            return await Promise.resolve(buffer);
        }

        return await new Promise((resolve, reject) =>
        {
            audioBufferSlice(buffer, start, end, (error, slicedAudioBuffer) =>
            {
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(slicedAudioBuffer);
                }
            });
        });
    }
}
