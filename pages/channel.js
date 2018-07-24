import Link from 'next/link'
import Layout from '../components/Layout'
import ChannelGrid from '../components/ChannelGrid'
import PodcastListWithClick from '../components/PodcastListWithClick'
import Error from './_error'
import PodcastPlayer from '../components/PodcastPlayer'

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      openPodcast: null
    }
  }

  static async getInitialProps({ query }) {
    let idChannel = query.id

    try {
      let [reqChannel, reqSeries, reqAudios] = await Promise.all([
        fetch(`https://api.audioboom.com/channels/${idChannel}`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`)
      ])

      if( reqChannel.status >= 404 ) {
        res.statusCode = reqChannel.status
        return { channel: null, audioClips: null, series: null, statusCode: reqChannel.status}
      }

      let dataChannel = await reqChannel.json()
      let channel = dataChannel.body.channel

      let dataAudios = await reqAudios.json()
      let audioClips = dataAudios.body.audio_clips

      let dataSeries = await reqSeries.json()
      let series = dataSeries.body.channels

      return { channel, audioClips, series, statusCode: 200 }
    } catch(e) {
      return { channel: null, audioClips: null, series: null, statusCode: 503}
    }
  }

  openPodcast = (event,podcast) => {
    event.preventDefault()
    this.setState({
      openPodcast: podcast
    })
  }

  closePodcast = (event) => {
    event.preventDefault()
    this.setState({
      openPodcast: null
    })
  }

  render() {
    const { channel, audioClips, series, statusCode } = this.props
    const { openPodcast } = this.state

    if( statusCode !== 200 ) {
      return <Error statusCode={ statusCode } />
    }

    return (
      <Layout title={`${channel.title} - App de Podcasts de Platzi`}>
        <div className="banner" style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }} />

        { openPodcast &&
          <div className="modal">
            <PodcastPlayer clip={ openPodcast } onClose={ this.closePodcast } />
          </div>
        }

        <h1>{ channel.title }</h1>

        { series.length > 0 &&
          <div>
            <h2>Series</h2>
            <ChannelGrid channels={ series } />
          </div>
        }

        <h2>Ultimos Podcasts</h2>
        <PodcastListWithClick
          // audioClips={audioClips}
          podcasts={audioClips}
          onClickPodcast={this.openPodcast}
        />


        <style jsx>{`
          header {
            color: #fff;
            background: #8756ca;
            padding: 15px;
            text-align: center;
          }
          .banner {
            width: 100%;
            padding-bottom: 25%;
            background-position: 50% 50%;
            background-size: cover;
            background-color: #aaa;
          }
          .channels {
            display: grid;
            grid-gap: 15px;
            padding: 15px;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
          a.channel {
            display: block;
            margin-bottom: 0.5em;
            color: #333;
            text-decoration: none;
          }
          .channel img {
            border-radius: 3px;
            box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
            width: 100%;
          }
          h1 {
            font-weight: 600;
            padding: 15px;
          }
          h2 {
            padding: 5px;
            font-size: 0.9em;
            font-weight: 600;
            margin: 0;
            text-align: center;
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0
            right: 0;
            bottom: 0;
            background: black;
            z-index: 99999;
          }
        `}</style>

        <style jsx global>{`
          body {
            margin: 0;
            font-family: system-ui;
            background: white;
          }
        `}</style>
      </Layout>
    );
  }
}