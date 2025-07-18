import React from 'react';
import { ICharacter } from '../types/api';
import styles from './CharacterProfileCard.module.css';

interface CharacterProfileCardProps {
  character: ICharacter;
}

const CharacterProfileCard: React.FC<CharacterProfileCardProps> = ({
  character,
}) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.header}>
        <h3 className={styles.name}>{character.name}</h3>
        {/* Assuming character object has a way to represent emotion or status */}
        {/* <p className={styles.emotion}>{character.currentEmotionState}</p> */}
      </div>

      <div className={styles.infoSection}>
        <h4>설명</h4>
        <p>{character.description}</p>
      </div>

      <div className={styles.infoSection}>
        <h4>고민</h4>
        <p>{character.problem}</p>
      </div>

      <div className={styles.infoSection}>
        <h4>성격</h4>
        <p>{character.personality}</p>
      </div>

      <div className={styles.imageContainer}>
        <img
          src={
            character.pixelatedImageUrl ||
            '/placeholders/default_character_image.png'
          }
          alt={character.name}
          className={styles.image}
        />
      </div>
    </div>
  );
};

export default CharacterProfileCard;
