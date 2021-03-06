import { useEffect, useState } from "react";

import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

import axios from "axios";

import { GameDetails } from "../types";

import { Loading } from "../components/Loading/Loading";

import { FaGamepad } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

import { StyledContainer } from "../styles/container";
import {
  StyledButton,
  StyledFailedContainer,
  StyledGameInfo,
  StyledPageContainer,
  StyledPageHeader,
} from "../styles/gamePage";

interface GameProps {
  apiKey: string;
}

const Game: NextPage<GameProps> = ({ apiKey }) => {
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<GameDetails | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const getGameData = async () => {
      try {
        const data = await axios
          .get<GameDetails>(`https://mmo-games.p.rapidapi.com/game?id=${id}`, {
            headers: {
              "x-rapidapi-host": "mmo-games.p.rapidapi.com",
              "x-rapidapi-key": apiKey,
            },
          })
          .then((response) => response.data);

        if (mounted) setGame(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getGameData();

    return () => {
      mounted = false;
    };
  }, [apiKey, id]);

  return (
    <>
      <Head>
        <title>{game && `${game.title} | `}Game Finder</title>
      </Head>

      <main>
        <StyledContainer>
          {isLoading ? (
            <Loading />
          ) : game ? (
            <StyledPageContainer>
              <StyledPageHeader>
                <div className="thumb">
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    width={365}
                    height={206}
                  />
                </div>

                <div className="info">
                  <h1>{game?.title}</h1>
                  <time>
                    {new Date(game.release_date).getFullYear().toString()}
                  </time>
                  <span>{game.genre}</span>
                  <span>Publisher: {game.publisher}</span>
                  <span>Developer: {game.developer}</span>
                </div>
              </StyledPageHeader>

              <StyledGameInfo>
                <div className="description">
                  <div dangerouslySetInnerHTML={{ __html: game.description }} />

                  <div className="buttons-container">
                    <Link href="/">
                      <a>
                        <StyledButton type="button" buttonType="back">
                          <IoMdArrowBack />
                          Back to list
                        </StyledButton>
                      </a>
                    </Link>
                    <a href={game.game_url} target="_blank" rel="noreferrer">
                      <StyledButton type="button" buttonType="play">
                        <FaGamepad />
                        Play now!
                      </StyledButton>
                    </a>
                  </div>
                </div>

                <div className="requirements">
                  <h3>System requirements</h3>
                  {game.minimum_system_requirements ? (
                    <>
                      <span>OS: {game.minimum_system_requirements.os}</span>
                      <span>
                        Memory: {game.minimum_system_requirements.memory}
                      </span>
                      <span>
                        Graphics: {game.minimum_system_requirements.graphics}
                      </span>
                      <span>
                        Processor: {game.minimum_system_requirements.processor}
                      </span>
                      <span>
                        Storage: {game.minimum_system_requirements.storage}
                      </span>
                    </>
                  ) : (
                    <span>No info about system requirements.</span>
                  )}
                </div>
              </StyledGameInfo>

              <div className="screenshots-container">
                <h2>Screenshots</h2>
                {game.screenshots.length > 0 ? (
                  <div className="screenshots">
                    {game.screenshots.map((screenshot) => (
                      <Image
                        src={screenshot.image}
                        alt={`${game.title} gameplay`}
                        width={485}
                        height={273}
                        key={screenshot.id}
                      />
                    ))}
                  </div>
                ) : (
                  <span>No screenshots for this game.</span>
                )}
              </div>
            </StyledPageContainer>
          ) : (
            <StyledFailedContainer>
              <h1>Failed to load game data.</h1>
              <button>
                <Link href="/">
                  <a>Return to home page</a>
                </Link>
              </button>
            </StyledFailedContainer>
          )}
        </StyledContainer>
      </main>
    </>
  );
};

export default Game;

export const getServerSideProps: GetServerSideProps = async () => {
  const apiKey = process.env.RAPIDAPI_KEY!;

  return {
    props: {
      apiKey,
    },
  };
};
