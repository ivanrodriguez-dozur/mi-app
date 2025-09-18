import React, { useRef } from 'react';
import { Dimensions, FlatList, Image, ScrollView, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ContentItem {
  id: string;
  image: string;
}

interface ProfileContentGridProps {
  items: ContentItem[];
  selectedTab: 'videos' | 'reels' | 'fotos';
  onTabChange: (tab: 'videos' | 'reels' | 'fotos') => void;
  allContent: {
    videos: ContentItem[];
    reels: ContentItem[];
    fotos: ContentItem[];
  };
}

export const ProfileContentGrid: React.FC<ProfileContentGridProps> = ({ 
  items, 
  selectedTab, 
  onTabChange, 
  allContent 
}) => {
  const scrollRef = useRef<ScrollView>(null);
  
  const tabs = ['videos', 'reels', 'fotos'] as const;

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollX / screenWidth);
    
    if (currentIndex >= 0 && currentIndex < tabs.length) {
      const newTab = tabs[currentIndex];
      if (newTab !== selectedTab) {
        onTabChange(newTab);
      }
    }
  };

  // Sincronizar el scroll cuando cambie el tab desde los headers
  React.useEffect(() => {
    const tabsArray = ['videos', 'reels', 'fotos'] as const;
    const targetIndex = tabsArray.findIndex(tab => tab === selectedTab);
    scrollRef.current?.scrollTo({ 
      x: targetIndex * screenWidth, 
      animated: true 
    });
  }, [selectedTab]);

  const renderGrid = (data: ContentItem[]) => (
    <View style={{ width: screenWidth, paddingHorizontal: 2 }}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={{ flex: 1, margin: 2 }}>
            <Image 
              source={{ uri: item.image }} 
              style={{ 
                width: '100%', 
                aspectRatio: 1, 
                borderRadius: 8 
              }} 
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScroll}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {renderGrid(allContent.videos)}
      {renderGrid(allContent.reels)}
      {renderGrid(allContent.fotos)}
    </ScrollView>
  );
};
