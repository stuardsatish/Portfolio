import { useState, useEffect } from "react";
import { MdArrowOutward } from "react-icons/md";
import { storage } from "../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

interface Props {
  index: number;
  image: string;
  alt?: string;
  video?: string;
  link?: string;
}

const WorkImage = (props: Props) => {
  const [imageUrl, setImageUrl] = useState(props.image);
  const [videoUrl, setVideoUrl] = useState(props.video || "");
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const projectRef = ref(storage, `portfolio/project-${props.index}`);
        const projectList = await listAll(projectRef);
        
        let resolvedVideo = "";
        let resolvedImage = "";

        for (const item of projectList.items) {
          const name = item.name.toLowerCase();
          if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) {
            resolvedVideo = await getDownloadURL(item);
          } else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
            resolvedImage = await getDownloadURL(item);
          }
        }

        if (resolvedImage) setImageUrl(resolvedImage);
        if (resolvedVideo) setVideoUrl(resolvedVideo);
      } catch (err) {
        console.error("Error fetching media in WorkImage:", err);
      }
    };

    fetchMedia();
  }, [props.index, props.image, props.video]);

  const handleMouseEnter = () => {
    if (videoUrl) {
      setIsVideo(true);
    }
  };

  return (
    <div className="work-image">
      <a
        className="work-image-in"
        href={props.link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVideo(false)}
        target="_blank"
        data-cursor={"disable"}
      >
        {props.link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}
        <img src={imageUrl} alt={props.alt} />
        {isVideo && videoUrl && <video src={videoUrl} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
