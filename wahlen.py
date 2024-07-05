import streamlit as st
import matplotlib.pyplot as plt
import math
import random
import streamlit.components.v1 as components

def get_default_district_votes():
    # input votes from 2020
    Grossbasel_Ost = {"votes":{"FDP":29_576, "LDP":59_533, "EVP":9_425, "SP":94_945, "CVP":22_171, "GB":47_428, "GLP":31_089, "SVP":36_131, "KL":1_406}, 
                      "total_seats": 27}
    Grossbasel_West = {"votes":{"FDP":38_797, "LDP":65_248, "EVP":16_652, "SP":181_483, "CVP":26_816, "GB":107_831, "GLP":41_200, "SVP":55_681}, 
                       "total_seats": 34}
    Kleinbasel = {"votes":{"FDP":16_667, "LDP":29_135, "EVP":4_651, "SP":87_910, "CVP":15_505, "GB":53_612, "GLP":17_155, "SVP":23_720, "FUK":3_726, "VA":5_354, "KL":2_662, "Andere":2_459}, 
                  "total_seats": 27}
    Riehen = {"votes":{"FDP":9_538, "LDP":11_410, "EVP":6_657, "SP":13_216, "CVP":6_478, "GB":4_805, "GLP":4_920, "SVP":11_133}, 
              "total_seats": 11}
    Bettingen = {"votes":{"BDV":179, "AB":262}, 
                 "total_seats": 1}

    districts = {
    "Grossbasel_Ost": Grossbasel_Ost,
    "Grossbasel_West": Grossbasel_West,
    "Kleinbasel": Kleinbasel,
    "Riehen": Riehen,
    "Bettingen": Bettingen
    }
    return districts

def fuse_seats(seats):
    # sum up all seats
    result = {}
    for district in seats:
        for party, count in district.items():
            if party in result:
                result[party] += count
            else:
                result[party] = count
    return result

def calculate_seats(votes, total_seats):
    total_votes = sum(votes.values())
    required_votes_per_seat = math.ceil(total_votes / total_seats)
    # first distribution of seats
    seats = {party: votes[party] // required_votes_per_seat for party in votes.keys()}

    remaining_seats = total_seats - sum(seats.values())
    # distribution of remaining seats
    quotients = {party: votes[party] / (seats[party] * 2 + 1) for party in votes.keys()}
    
    for _ in range(remaining_seats):
        max_quotient = max(quotients.values())
        max_party = random.choice([party for party, quotient in quotients.items() if abs(quotient - max_quotient) < 1e-6])
        seats[max_party] += 1
        quotients[max_party] = votes[max_party] / (seats[max_party] * 2 + 1)
    return seats

def plot_diagram(percentages):
    plt.figure(figsize=(8, 6))
    plt.bar(percentages.keys(), percentages.values())
    plt.xlabel('Pateien')
    plt.ylabel('% der Stimmen')
    plt.title('Stimmverhältnisse')
    plt.xticks(rotation=45)
    for party, percentage in percentages.items():
        plt.text(party, percentage,
                 f'{percentage:.2f}%', ha='center', va='bottom')
    st.pyplot(plt)

def plot_sitze(sitze):
    plt.figure(figsize=(8, 6))
    plt.bar(sitze.keys(), sitze.values())
    plt.xlabel('Pateien')
    plt.ylabel('Sitze')
    plt.title('Sitzzuteilung')
    plt.xticks(rotation=45)

    for party, sitze in sitze.items():
        plt.text(party, sitze,
                 f'{sitze}', ha='center', va='bottom')

    st.pyplot(plt)


def main():
    # title
    st.set_page_config(page_title='Wahlen 2024 Basel')

    # Side title in the main field
    st.title('Grossratswahlen 2024 Simulation Sitzzuteilung Basel-Stadt')
    st.write(
        'Das folgende Tool simuliert die Sitzverteilung für die Grossratswahlen 2024 in Basel gemäss Bundesgesetz über die politischen Rechte. Das tool wurde von [Hannes Hui](https://hanneshui.ch) entworfen und umgesetzt. Die Korrektheit der Simulation ist nicht garantiert. Bei Fehlern oder Verbesserungsvorschlägen freue ich mich über eure Rückmeldung. Zur Transparenz und vereinfachten Mitwirkung befindet sich der Source Code dieses Projektes frei zugänglich auf Github: [Repository](https://github.com/hanneshui/Wahlen2024)')
    st.sidebar.title('Parteistimmen für Nationalratswahlen 2024 Basel')

    districts = get_default_district_votes()

    # Dropdown for districts
    selected_district = st.sidebar.selectbox('Wählen Sie einen Bezirk aus', list(districts.keys()))

    # input fields for votes
    for party, votes in districts[selected_district]["votes"].items():
        districts[selected_district]["votes"][party] = st.sidebar.number_input(f'Stimmen für {party}', value=votes, step = 500)

    # if button then perform calculations
    if st.button('Berechnungen starten'):
        for district in districts.values():
            district["seats"] = calculate_seats(district["votes"], district["total_seats"])

        all_seats = fuse_seats([district["seats"] for district in districts.values()])
        # display results
        district = districts[selected_district]
        # Erstellen Sie zwei Spalten
        col1, col2 = st.columns(2)

        # Zeigen Sie das erste Diagramm in der ersten Spalte an
        with col1:
            st.write(f'Sitzzuteilung für {selected_district}')
            plot_sitze(district["seats"])

        # Zeigen Sie das zweite Diagramm in der zweiten Spalte an
        with col2:
            st.write(f'Stimmenverteilung für {selected_district}')
            plot_diagram({party: votes / sum(district["votes"].values()) * 100 for party, votes in district["votes"].items()})
            
        st.write(f'Sitzverteilung insgesamt:')
        plot_sitze(all_seats)
        

if __name__ == '__main__':
    main()
