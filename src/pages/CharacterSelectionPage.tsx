import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ICharacter } from '../types/api';
import CharacterProfileCard from '../components/CharacterProfileCard';
import styles from './CharacterSelectionPage.module.css';

const CharacterSelectionPage: React.FC = () => {
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const unselectedChars = await api.character.getUnselected();
        if (unselectedChars && unselectedChars.length > 0) {
          setCharacters(unselectedChars);
        } else {
          // If no unselected characters, maybe they were already generated.
          // Let's try generating them.
          const newChars = await api.character.generateInitialCharacters();
          setCharacters(newChars as ICharacter[]);
        }
      } catch (error) {
        console.error('Failed to fetch or generate characters:', error);
        alert('캐릭터를 불러오는 데 실패했습니다. 대시보드로 돌아갑니다.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacters();
  }, [navigate]);

  const handleSelectCharacter = async (characterId: string) => {
    try {
      await api.character.selectCharacter(characterId);
      navigate('/play');
    } catch (error) {
      console.error('Failed to select character:', error);
      alert('캐릭터 선택에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>페르소나를 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>마음의 조각들</h1>
      <p className={styles.subtitle}>
        당신의 마음 속에서 태어난 페르소나들입니다. 대화를 나누고 싶은
        페르소나를 선택하세요.
      </p>
      <div className={styles.cardGrid}>
        {characters.map((char) => (
          <div key={char._id} onClick={() => handleSelectCharacter(char._id)}>
            <CharacterProfileCard character={char} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelectionPage;
