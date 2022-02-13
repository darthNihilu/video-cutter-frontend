import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import YouTube from "react-youtube";
import { Button, TextField } from "@mui/material";
import { useQuery } from "react-query";
import Flex from "./components/Flex";
import Box from "./components/Box";
import Text from "./components/Text";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
`;

const calculateSeconds = (elapsed_sec: number) => {
  const elapsed_ms = Math.floor(elapsed_sec * 1000);
  const ms = elapsed_ms % 1000;
  const min = Math.floor(elapsed_ms / 60000);
  const seconds = Math.floor((elapsed_ms - min * 60000) / 1000);

  return `${min.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${ms.toString().padStart(3, "0")}`;
};

function App() {
  const [duration, setDuration] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [link, setLink] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const playerRef = useRef<any>();

  const parseLinkToId = useCallback((link: string) => {
    let regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = link.match(regExp);
    return match && match[7].length === 11 ? match[7] : "";
  }, []);

  useEffect(() => {
    if (parseLinkToId(link) === "") return;
    const interval = setInterval(async () => {
      const elapsed_sec =
        await playerRef.current.internalPlayer.getCurrentTime();

      setElapsed(elapsed_sec);

      if (isPreview)
        if (elapsed_sec >= endTime) {
          playerRef.current.internalPlayer.pauseVideo();
        }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPreview, endTime, parseLinkToId, link]);

  const onChange = (e: any) => {
    setLink(e.target.value);
  };

  const onPreview = () => {
    if (isPreview) {
      setIsPreview(false);
      setStartTime(0);
      setEndTime(0);
    } else {
      playerRef.current.internalPlayer.playVideo();
      playerRef.current.internalPlayer.seekTo(startTime);
      setIsPreview(true);
    }
  };

  const onDownload = () => {
    refetch();
  };

  const onReady = (event: any) => {
    setDuration(event.target.getDuration());
  };

  const cutUrl = async () => {
    const endpoint = `${process.env.REACT_APP_BACKEND_URL}/cut?url=${link}&startTime=${startTime}&endTime=${endTime}`;
    const response = await fetch(endpoint);
    return await response.text();
  };

  const {
    data: downloadData,
    refetch,
    isFetching,
    isLoading,
    isError,
  } = useQuery("cut", cutUrl, {
    enabled: false,
  });

  const checkIfDownloadDisabled = useMemo(() => {
    return startTime >= endTime || endTime === 0;
  }, [endTime, startTime]);

  const getButtonState = useMemo(() => {
    if (isFetching || isLoading) return "Загрузка...";
    if (isError) return "Ошибка";
    if (downloadData) return "Скачать";
    return "Обрезать";
  }, [downloadData, isError, isFetching, isLoading]);

  return (
    <Container>
      <Flex>
        <TextField
          id="outlined-basic"
          label="Вставьте ссылку на видео"
          variant="outlined"
          value={link}
          onChange={onChange}
          style={{ width: 400 }}
        />
      </Flex>

      {parseLinkToId(link) !== "" && (
        <Flex mt={32}>
          <YouTube
            videoId={parseLinkToId(link)}
            onReady={onReady}
            onPlay={(event) => console.log("update", event)}
            ref={playerRef}
          />
          <Flex flexDirection="column" ml={16}>
            <Text mb="12px">
              Продолжительность: {calculateSeconds(duration)}
            </Text>
            <Text mb="4px">Текущее время</Text>
            <TextField value={calculateSeconds(elapsed)} />
            <Flex justifyContent="space-around" mt="8px">
              <Button variant="contained" onClick={() => setStartTime(elapsed)}>
                Начало
              </Button>
              <Button variant="contained" onClick={() => setEndTime(elapsed)}>
                Конец
              </Button>
            </Flex>
            <Flex mt={16} alignItems="center" justifyContent="center">
              <Flex
                alignItems="center"
                flexDirection="column"
                height="100%"
                justifyContent="space-around"
              >
                <Text mr="8px" mb="8px">
                  Начало
                </Text>
                <Text mr="8px">Конец</Text>
              </Flex>
              <Flex alignItems="center" ml="8px" flexDirection="column">
                <TextField
                  value={calculateSeconds(startTime)}
                  style={{ marginBottom: 8 }}
                />
                <TextField value={calculateSeconds(endTime)} />
              </Flex>
            </Flex>
            <Box mt={16}>
              <Button
                onClick={onPreview}
                variant="contained"
                style={{ marginRight: 8 }}
              >
                {!isPreview
                  ? "Предварительный просмотр"
                  : "Отключить предварительный просмотр"}
              </Button>
              {getButtonState !== "Скачать" ? (
                <Button
                  onClick={onDownload}
                  disabled={checkIfDownloadDisabled}
                  variant="contained"
                >
                  {getButtonState}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  component="a"
                  href={`${process.env.REACT_APP_BACKEND_URL}${downloadData}`}
                  download
                >
                  {getButtonState}
                </Button>
              )}
            </Box>
          </Flex>
        </Flex>
      )}
    </Container>
  );
}

export default App;
