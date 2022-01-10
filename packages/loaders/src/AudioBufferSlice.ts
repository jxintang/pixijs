const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function AudioBufferSlice(buffer: ArrayBuffer, begin: number, end: number, callback: function): ArrayBuffer
{
    if (!(this instanceof AudioBufferSlice))
    {
        return new AudioBufferSlice(buffer, begin, end, callback);
    }

    let error = null;

    const duration = buffer.duration;
    const channels = buffer.numberOfChannels;
    const rate = buffer.sampleRate;

    if (typeof end === 'function')
    {
        callback = end;
        end = duration;
    }

    // milliseconds to seconds
    begin = begin / 1000;
    end = end / 1000;

    if (begin < 0)
    {
        error = new RangeError('begin time must be greater than 0');
    }

    if (end > duration)
    {
        error = new RangeError(`end time must be less than or equal to ${duration}`);
    }

    if (typeof callback !== 'function')
    {
        error = new TypeError('callback must be a function');
    }

    const startOffset = rate * begin;
    const endOffset = rate * end;
    const frameCount = endOffset - startOffset;
    let newArrayBuffer;

    try
    {
        newArrayBuffer = audioContext.createBuffer(channels, endOffset - startOffset, rate);
        const anotherArray = new Float32Array(frameCount);
        const offset = 0;

        for (let channel = 0; channel < channels; channel++)
        {
            buffer.copyFromChannel(anotherArray, channel, startOffset);
            newArrayBuffer.copyToChannel(anotherArray, channel, offset);
        }
    }
    catch (e)
    {
        error = e;
    }

    callback(error, newArrayBuffer);
}

export default AudioBufferSlice;
