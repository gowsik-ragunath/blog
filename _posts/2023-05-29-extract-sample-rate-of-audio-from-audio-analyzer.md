---
c
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/05/29/extract-sample-rate-of-audio-from-audio-analyzer/) and featured in [Ruby Weekly issue #656](https://rubyweekly.com/issues/656).

With ActiveStorage, storing files in Rails is made easier.

However, when it comes to audio files, it's often necessary to go beyond simple storage and analyze the audio content itself.

To achieve this, integrating a media stream analyzer into a Rails application can be incredibly valuable.

For this, we can use the ffprobe which is already used by the Rails analyzer to extract basic information about the media file.

### How does the Rails Analyzer work?

Rails has three analyzers to extract metadata of a blob, they are AudioAnalyzer, ImageAnalyzer, and VideoAnalyzer.

It also has NullAnalyzer which will be used if content type is not detected.

When the `analyze` method is called which is a method in [ActiveStorage::Blob::Analyzable](https://github.com/rails/rails/blob/main/activestorage/app/models/active_storage/blob/analyzable.rb) module.

It will first detect the analyzer class based on the content type, then analyzer will then extract metadata using [ffprobe](https://ffmpeg.org/ffprobe.html)(for audio and video) or [ImageMagick](https://imagemagick.org/index.php)(for image) and will update the blob record with the extracted metadata.

### Before:

In the previous version of Rails, to get the sample rate of an audio file we would have to download the file and pass it to [FFmpeg](https://ffmpeg.org/) or [ffprobe](https://ffmpeg.org/ffprobe.html) to get the sample rate details.

We can use the [streamio-ffmpeg](https://github.com/streamio/streamio-ffmpeg) gem which is a ffmpeg wrapper to extract these details in Ruby.

{% highlight ruby %}

blob = ActiveStorage::Blob.find_by(filename:  "audio.mp3")
path = ActiveStorage::Blob.service.send(:path_for, blob.key)
audio = FFMPEG::Movie.new(path)

audio.audio_sample_rate
# 44100

{% endhighlight %}

Running the blob `analyze` method will only add `duration` and `bit_rate` in metadata.

{% highlight ruby %}

blog.analyze

blob.metadata
# {"identified"=>true, "duration"=>0.914286, "bit_rate"=>128000, "analyzed"=>true}

{% endhighlight %}

### After:

With [this change](https://github.com/rails/rails/pull/47749) audio analyzer will now return `sample rate` along with information like `bit rate`, and `duration`.

In the upcoming Rails version (I have used Rails 7.1.0 alpha), when the blob is created we can run the `analyze` method which will also add the `sample rate` in the metadata. 

{% highlight ruby %}

blog = ActiveStorage::Blob.create_and_upload!(io: File.open("#{Rails.root}/audio.mp3"), filename: "audio.mp3", content_type: "audio")
blog.analyze

blog.metadata
# {"identified"=>true, "duration"=>0.914286, "bit_rate"=>128000, "sample_rate"=>44100, "analyzed"=>true}

blob.metadata[:sample_rate]
# 44100

{% endhighlight %}
